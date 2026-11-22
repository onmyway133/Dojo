//! Apple file formats: property lists, provisioning profiles and Mach-O binaries.

use std::io::Cursor;
use std::time::{SystemTime, UNIX_EPOCH};

use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use plist::Value;
use serde_json::{Map, Value as Json};

use crate::error::{AppError, AppResult};
use crate::tools::certificate::{self, CertificateInfo};

// MARK: Property lists

/// Parses an XML or binary property list.
pub fn parse_plist(bytes: &[u8]) -> AppResult<Value> {
    Value::from_reader(Cursor::new(bytes))
        .map_err(|e| AppError::invalid(format!("Invalid property list: {e}")))
}

/// Unix seconds for a plist date.
fn unix_seconds(date: plist::Date) -> i64 {
    let time: SystemTime = date.into();
    match time.duration_since(UNIX_EPOCH) {
        Ok(d) => d.as_secs() as i64,
        Err(e) => -(e.duration().as_secs() as i64),
    }
}

/// JSON for a plist value: dates become ISO 8601 strings, data becomes base64.
pub fn plist_to_json_value(value: &Value) -> Json {
    match value {
        Value::Array(items) => Json::Array(items.iter().map(plist_to_json_value).collect()),
        Value::Dictionary(dict) => Json::Object(
            dict.iter()
                .map(|(k, v)| (k.clone(), plist_to_json_value(v)))
                .collect::<Map<_, _>>(),
        ),
        Value::Boolean(b) => Json::Bool(*b),
        Value::Data(data) => Json::String(STANDARD.encode(data)),
        Value::Date(date) => Json::String(date.to_xml_format()),
        Value::Real(r) => serde_json::Number::from_f64(*r).map_or(Json::Null, Json::Number),
        Value::Integer(i) => match (i.as_signed(), i.as_unsigned()) {
            (Some(s), _) => Json::from(s),
            (None, Some(u)) => Json::from(u),
            _ => Json::Null,
        },
        Value::String(s) => Json::String(s.clone()),
        Value::Uid(uid) => Json::from(uid.get()),
        _ => Json::Null,
    }
}

/// Plist (XML or binary) to pretty JSON.
pub fn plist_to_json(bytes: &[u8]) -> AppResult<String> {
    let value = parse_plist(bytes)?;
    serde_json::to_string_pretty(&plist_to_json_value(&value))
        .map_err(|e| AppError::invalid(e.to_string()))
}

fn json_to_plist_value(value: &Json) -> AppResult<Value> {
    Ok(match value {
        Json::Null => return Err(AppError::invalid("Property lists have no null value")),
        Json::Bool(b) => Value::Boolean(*b),
        Json::Number(n) => match (n.as_i64(), n.as_u64(), n.as_f64()) {
            (Some(i), _, _) => Value::Integer(i.into()),
            (None, Some(u), _) => Value::Integer(u.into()),
            (_, _, Some(f)) => Value::Real(f),
            _ => return Err(AppError::invalid(format!("Unsupported number {n}"))),
        },
        Json::String(s) => Value::String(s.clone()),
        Json::Array(items) => Value::Array(
            items
                .iter()
                .map(json_to_plist_value)
                .collect::<AppResult<_>>()?,
        ),
        Json::Object(map) => {
            let mut dict = plist::Dictionary::new();
            for (k, v) in map {
                dict.insert(k.clone(), json_to_plist_value(v)?);
            }
            Value::Dictionary(dict)
        }
    })
}

/// Any plist (binary or XML) re-written as XML text.
pub fn plist_to_xml(bytes: &[u8]) -> AppResult<String> {
    write_xml(&parse_plist(bytes)?)
}

fn write_xml(value: &Value) -> AppResult<String> {
    let mut out = Vec::new();
    value
        .to_writer_xml(&mut out)
        .map_err(|e| AppError::invalid(e.to_string()))?;
    let mut xml = String::from_utf8(out).map_err(|e| AppError::invalid(e.to_string()))?;
    if !xml.ends_with('\n') {
        xml.push('\n');
    }
    Ok(xml)
}

/// JSON to an XML property list.
pub fn json_to_plist(json: &str) -> AppResult<String> {
    let parsed: Json =
        serde_json::from_str(json).map_err(|e| AppError::invalid(format!("Invalid JSON: {e}")))?;
    write_xml(&json_to_plist_value(&parsed)?)
}

// MARK: Provisioning profiles

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileInfo {
    pub name: Option<String>,
    pub app_id_name: Option<String>,
    pub application_identifier: Option<String>,
    pub bundle_id: Option<String>,
    pub team_name: Option<String>,
    pub team_ids: Vec<String>,
    pub platforms: Vec<String>,
    pub uuid: Option<String>,
    /// Unix seconds.
    pub creation_date: Option<i64>,
    pub expiration_date: Option<i64>,
    pub kind: String,
    pub xcode_managed: bool,
    pub provisions_all_devices: bool,
    pub devices: Vec<String>,
    pub entitlements: Json,
    pub certificates: Vec<CertificateInfo>,
    /// The whole profile plist as JSON, for anything not shown above.
    pub raw: Json,
}

/// The XML plist inside a CMS-signed profile. The payload is stored unencrypted, so slicing
/// between the XML header and the closing tag avoids a CMS parser. Plain plist text works too.
fn embedded_plist(bytes: &[u8]) -> AppResult<&[u8]> {
    let start = find(bytes, b"<?xml").or_else(|| find(bytes, b"<plist"));
    let end_tag = b"</plist>";
    let end = rfind(bytes, end_tag);
    match (start, end) {
        (Some(s), Some(e)) if e > s => Ok(&bytes[s..e + end_tag.len()]),
        _ => Err(AppError::invalid(
            "No property list found. Choose a .mobileprovision or .provisionprofile file",
        )),
    }
}

fn find(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack.windows(needle.len()).position(|w| w == needle)
}

fn rfind(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack.windows(needle.len()).rposition(|w| w == needle)
}

fn strings(value: Option<&Value>) -> Vec<String> {
    value
        .and_then(Value::as_array)
        .map(|a| {
            a.iter()
                .filter_map(|v| v.as_string().map(str::to_owned))
                .collect()
        })
        .unwrap_or_default()
}

pub fn decode_profile(bytes: &[u8]) -> AppResult<ProfileInfo> {
    let value = parse_plist(embedded_plist(bytes)?)?;
    let dict = value
        .as_dictionary()
        .ok_or_else(|| AppError::invalid("The profile is not a dictionary"))?;
    let string = |key: &str| dict.get(key).and_then(Value::as_string).map(str::to_owned);
    let date = |key: &str| dict.get(key).and_then(Value::as_date).map(unix_seconds);

    let entitlements = dict.get("Entitlements").and_then(Value::as_dictionary);
    let entitlement_string = |key: &str| {
        entitlements
            .and_then(|e| e.get(key))
            .and_then(Value::as_string)
            .map(str::to_owned)
    };
    // macOS profiles use `com.apple.application-identifier`.
    let application_identifier = entitlement_string("application-identifier")
        .or_else(|| entitlement_string("com.apple.application-identifier"));
    let team_ids = {
        let ids = strings(dict.get("TeamIdentifier"));
        if ids.is_empty() {
            strings(dict.get("ApplicationIdentifierPrefix"))
        } else {
            ids
        }
    };
    let bundle_id = application_identifier
        .as_ref()
        .map(|id| match id.split_once('.') {
            Some((prefix, rest)) if team_ids.iter().any(|t| t == prefix) || prefix.len() == 10 => {
                rest.to_owned()
            }
            _ => id.clone(),
        });

    let devices = strings(dict.get("ProvisionedDevices"));
    let provisions_all_devices = dict
        .get("ProvisionsAllDevices")
        .and_then(Value::as_boolean)
        .unwrap_or(false);
    let get_task_allow = entitlements
        .and_then(|e| {
            e.get("get-task-allow")
                .or_else(|| e.get("com.apple.security.get-task-allow"))
        })
        .and_then(Value::as_boolean)
        .unwrap_or(false);
    let platforms = strings(dict.get("Platform"));
    let is_mac = !platforms.is_empty() && platforms.iter().all(|p| p == "OSX");
    let kind = profile_kind(
        is_mac,
        get_task_allow,
        !devices.is_empty(),
        provisions_all_devices,
    )
    .to_owned();

    let certificates = dict
        .get("DeveloperCertificates")
        .and_then(Value::as_array)
        .map(|certs| {
            certs
                .iter()
                .filter_map(Value::as_data)
                .filter_map(|der| certificate::describe(der).ok())
                .collect()
        })
        .unwrap_or_default();

    let mut raw = plist_to_json_value(&value);
    // The certificates and the signed DER copy are long base64 blobs; they are shown decoded.
    if let Json::Object(map) = &mut raw {
        map.remove("DeveloperCertificates");
        map.remove("DER-Encoded-Profile");
    }

    Ok(ProfileInfo {
        name: string("Name"),
        app_id_name: string("AppIDName"),
        application_identifier,
        bundle_id,
        team_name: string("TeamName"),
        team_ids,
        platforms,
        uuid: string("UUID"),
        creation_date: date("CreationDate"),
        expiration_date: date("ExpirationDate"),
        kind,
        xcode_managed: dict
            .get("IsXcodeManaged")
            .and_then(Value::as_boolean)
            .unwrap_or(false),
        provisions_all_devices,
        devices,
        entitlements: entitlements.map_or(Json::Object(Map::new()), |e| {
            plist_to_json_value(&Value::Dictionary(e.clone()))
        }),
        certificates,
        raw,
    })
}

/// iOS development profiles allow debugging (`get-task-allow`); ad hoc lists devices without it;
/// enterprise (iOS) and Developer ID (macOS) provision every device; App Store has neither.
/// macOS has no ad hoc type and its development profiles omit `get-task-allow`.
fn profile_kind(
    is_mac: bool,
    get_task_allow: bool,
    has_devices: bool,
    all_devices: bool,
) -> &'static str {
    if all_devices {
        if is_mac { "Developer ID" } else { "Enterprise" }
    } else if get_task_allow || (is_mac && has_devices) {
        "Development"
    } else if has_devices {
        "Ad Hoc"
    } else {
        "App Store"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const PROFILE: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>AppIDName</key><string>Sample</string>
    <key>CreationDate</key><date>2026-01-01T00:00:00Z</date>
    <key>ExpirationDate</key><date>2027-01-01T00:00:00Z</date>
    <key>Entitlements</key>
    <dict>
        <key>application-identifier</key><string>ABCDE12345.com.example.sample</string>
        <key>get-task-allow</key><true/>
    </dict>
    <key>Name</key><string>Sample Development</string>
    <key>Platform</key><array><string>iOS</string></array>
    <key>ProvisionedDevices</key><array><string>00008110-000A1B2C3D4E5F60</string></array>
    <key>TeamIdentifier</key><array><string>ABCDE12345</string></array>
    <key>TeamName</key><string>Example Team</string>
    <key>UUID</key><string>11111111-2222-3333-4444-555555555555</string>
</dict>
</plist>"#;

    /// Wraps the plist in bytes that stand in for the CMS envelope.
    fn signed(plist: &str) -> Vec<u8> {
        let mut bytes = vec![0x30, 0x80, 0x06, 0x09, 0xFF, 0x00];
        bytes.extend_from_slice(plist.as_bytes());
        bytes.extend_from_slice(&[0xA0, 0x82, 0x00, 0x01]);
        bytes
    }

    #[test]
    fn decodes_profile_inside_signature() {
        let info = decode_profile(&signed(PROFILE)).unwrap();
        assert_eq!(info.name.as_deref(), Some("Sample Development"));
        assert_eq!(info.bundle_id.as_deref(), Some("com.example.sample"));
        assert_eq!(info.team_ids, vec!["ABCDE12345"]);
        assert_eq!(info.kind, "Development");
        assert_eq!(info.devices.len(), 1);
        assert_eq!(info.expiration_date, Some(1_798_761_600));
        assert_eq!(info.entitlements["get-task-allow"], Json::Bool(true));
    }

    #[test]
    fn rejects_files_without_plist() {
        assert!(decode_profile(b"not a profile").is_err());
    }

    #[test]
    fn profile_kinds() {
        assert_eq!(profile_kind(false, false, true, false), "Ad Hoc");
        assert_eq!(profile_kind(true, false, true, false), "Development");
        assert_eq!(profile_kind(false, false, false, false), "App Store");
        assert_eq!(profile_kind(true, false, false, true), "Developer ID");
        assert_eq!(profile_kind(false, false, false, true), "Enterprise");
    }

    #[test]
    fn plist_json_round_trip() {
        let json = plist_to_json(PROFILE.as_bytes()).unwrap();
        assert!(json.contains("\"CreationDate\": \"2026-01-01T00:00:00Z\""));
        let xml = json_to_plist(r#"{"name":"Dojo","count":3,"ratio":0.5,"on":true,"tags":["a"]}"#)
            .unwrap();
        assert!(xml.contains("<key>count</key>"));
        assert!(xml.contains("<integer>3</integer>"));
        let back = plist_to_json(xml.as_bytes()).unwrap();
        // Binary plists (bplist00) convert too.
        let mut binary = Vec::new();
        parse_plist(xml.as_bytes())
            .unwrap()
            .to_writer_binary(&mut binary)
            .unwrap();
        assert!(binary.starts_with(b"bplist00"));
        assert!(
            plist_to_xml(&binary)
                .unwrap()
                .contains("<string>Dojo</string>")
        );
        assert!(back.contains("\"ratio\": 0.5"));
    }
}

// MARK: Mach-O UUIDs

#[derive(Debug, serde::Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ArchUuid {
    pub arch: String,
    /// Uppercase with dashes, as `dwarfdump --uuid` and crash logs print it.
    pub uuid: Option<String>,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MachOInfo {
    /// The binary inside a bundle, or the file itself.
    pub binary: String,
    pub archs: Vec<ArchUuid>,
}

/// Random access to a file without reading all of it (DWARF files can be huge).
pub trait ByteSource {
    fn bytes(&self, offset: u64, len: usize) -> AppResult<Vec<u8>>;
}

impl ByteSource for [u8] {
    fn bytes(&self, offset: u64, len: usize) -> AppResult<Vec<u8>> {
        let start = usize::try_from(offset).map_err(|_| truncated())?;
        self.get(start..start.checked_add(len).ok_or_else(truncated)?)
            .map(<[u8]>::to_vec)
            .ok_or_else(truncated)
    }
}

impl ByteSource for std::fs::File {
    fn bytes(&self, offset: u64, len: usize) -> AppResult<Vec<u8>> {
        use std::os::unix::fs::FileExt;
        let mut buf = vec![0; len];
        self.read_exact_at(&mut buf, offset)
            .map_err(|_| truncated())?;
        Ok(buf)
    }
}

fn truncated() -> AppError {
    AppError::invalid("The file ends early; not a complete Mach-O binary")
}

const FAT_MAGIC: u32 = 0xCAFE_BABE;
const FAT_MAGIC_64: u32 = 0xCAFE_BABF;
const MH_MAGIC: u32 = 0xFEED_FACE;
const MH_MAGIC_64: u32 = 0xFEED_FACF;
const LC_UUID: u32 = 0x1B;

fn u32_at(bytes: &[u8], at: usize, big: bool) -> u32 {
    let b = [bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]];
    if big {
        u32::from_be_bytes(b)
    } else {
        u32::from_le_bytes(b)
    }
}

fn arch_name(cpu: u32, subtype: u32) -> String {
    let sub = subtype & 0x00FF_FFFF;
    match (cpu, sub) {
        (0x0100_000C, 2) => "arm64e".into(),
        (0x0100_000C, 0 | 1) => "arm64".into(),
        (0x0100_000C, _) => format!("arm64 (subtype {sub})"),
        (0x0200_000C, _) => "arm64_32".into(),
        (0x0100_0007, 8) => "x86_64h".into(),
        (0x0100_0007, _) => "x86_64".into(),
        (7, _) => "i386".into(),
        (12, 9) => "armv7".into(),
        (12, 11) => "armv7s".into(),
        (12, 12) => "armv7k".into(),
        (12, _) => "arm".into(),
        _ => format!("cpu {cpu:#x}"),
    }
}

fn format_uuid(b: &[u8]) -> String {
    let hex: String = b.iter().map(|x| format!("{x:02X}")).collect();
    format!(
        "{}-{}-{}-{}-{}",
        &hex[0..8],
        &hex[8..12],
        &hex[12..16],
        &hex[16..20],
        &hex[20..32]
    )
}

/// One thin Mach-O image starting at `offset`.
fn thin_uuid(src: &(impl ByteSource + ?Sized), offset: u64) -> AppResult<ArchUuid> {
    let header = src.bytes(offset, 32)?;
    let magic_le = u32_at(&header, 0, false);
    let magic_be = u32_at(&header, 0, true);
    let (big, is64) = match (magic_le, magic_be) {
        (MH_MAGIC_64, _) => (false, true),
        (MH_MAGIC, _) => (false, false),
        (_, MH_MAGIC_64) => (true, true),
        (_, MH_MAGIC) => (true, false),
        _ => return Err(AppError::invalid("Not a Mach-O binary")),
    };
    let arch = arch_name(u32_at(&header, 4, big), u32_at(&header, 8, big));
    let ncmds = u32_at(&header, 16, big);
    let sizeofcmds = u32_at(&header, 20, big) as usize;
    if ncmds > 10_000 || sizeofcmds > 64 * 1024 * 1024 {
        return Err(AppError::invalid("Mach-O header looks corrupt"));
    }
    let commands = src.bytes(offset + if is64 { 32 } else { 28 }, sizeofcmds)?;
    let mut at = 0usize;
    for _ in 0..ncmds {
        if at + 8 > commands.len() {
            break;
        }
        let cmd = u32_at(&commands, at, big);
        let size = u32_at(&commands, at + 4, big) as usize;
        if cmd == LC_UUID && at + 24 <= commands.len() {
            return Ok(ArchUuid {
                arch,
                uuid: Some(format_uuid(&commands[at + 8..at + 24])),
            });
        }
        if size < 8 {
            break;
        }
        at += size;
    }
    Ok(ArchUuid { arch, uuid: None })
}

/// UUIDs of every architecture in a thin or universal (fat) Mach-O file.
pub fn macho_uuids(src: &(impl ByteSource + ?Sized)) -> AppResult<Vec<ArchUuid>> {
    let head = src.bytes(0, 8)?;
    let magic = u32_at(&head, 0, true);
    if magic != FAT_MAGIC && magic != FAT_MAGIC_64 {
        return Ok(vec![thin_uuid(src, 0)?]);
    }
    let count = u32_at(&head, 4, true);
    // Java class files share 0xCAFEBABE; their "count" is a version number in the 40s+.
    if count == 0 || count > 32 {
        return Err(AppError::invalid("Not a Mach-O binary"));
    }
    let entry = if magic == FAT_MAGIC_64 { 32 } else { 20 };
    let table = src.bytes(8, entry * count as usize)?;
    (0..count as usize)
        .map(|i| {
            let e = &table[i * entry..];
            let offset = if magic == FAT_MAGIC_64 {
                u64::from_be_bytes(e[8..16].try_into().unwrap_or_default())
            } else {
                u64::from(u32_at(e, 8, true))
            };
            thin_uuid(src, offset)
        })
        .collect()
}

/// The executable inside a .dSYM, .app, .appex or .framework folder.
pub fn bundle_binary(dir: &std::path::Path) -> AppResult<std::path::PathBuf> {
    let dwarf = dir.join("Contents/Resources/DWARF");
    if dwarf.is_dir() {
        if let Some(first) = std::fs::read_dir(&dwarf)?
            .filter_map(Result::ok)
            .map(|e| e.path())
            .find(|p| p.is_file())
        {
            return Ok(first);
        }
    }
    for info in [
        "Contents/Info.plist",
        "Info.plist",
        "Resources/Info.plist",
        "Versions/Current/Resources/Info.plist",
    ] {
        let Ok(bytes) = std::fs::read(dir.join(info)) else {
            continue;
        };
        let Some(name) = parse_plist(&bytes).ok().and_then(|v| {
            v.as_dictionary()
                .and_then(|d| d.get("CFBundleExecutable"))
                .and_then(Value::as_string)
                .map(str::to_owned)
        }) else {
            continue;
        };
        for candidate in [
            dir.join("Contents/MacOS").join(&name),
            dir.join(&name),
            dir.join("Versions/Current").join(&name),
        ] {
            if candidate.is_file() {
                return Ok(candidate);
            }
        }
    }
    Err(AppError::invalid(
        "No executable found in this folder. Drop a .dSYM, .app, .framework or a binary",
    ))
}

pub fn macho_file(path: &std::path::Path) -> AppResult<MachOInfo> {
    let binary = if path.is_dir() {
        bundle_binary(path)?
    } else {
        path.to_path_buf()
    };
    let file = std::fs::File::open(&binary)?;
    Ok(MachOInfo {
        binary: binary.to_string_lossy().into_owned(),
        archs: macho_uuids(&file)?,
    })
}

#[cfg(test)]
mod macho_tests {
    use super::*;

    /// A thin 64-bit arm64 header with one segment-like command and an LC_UUID.
    fn thin(uuid_byte: u8) -> Vec<u8> {
        let mut b = Vec::new();
        for v in [MH_MAGIC_64, 0x0100_000C, 0, 2, 2, 16 + 24, 0, 0] {
            b.extend_from_slice(&v.to_le_bytes());
        }
        b.extend_from_slice(&0x19u32.to_le_bytes());
        b.extend_from_slice(&16u32.to_le_bytes());
        b.extend_from_slice(&[0; 8]);
        b.extend_from_slice(&LC_UUID.to_le_bytes());
        b.extend_from_slice(&24u32.to_le_bytes());
        b.extend_from_slice(&[uuid_byte; 16]);
        b
    }

    #[test]
    fn reads_thin_binary() {
        let archs = macho_uuids(thin(0xAB).as_slice()).unwrap();
        assert_eq!(
            archs,
            vec![ArchUuid {
                arch: "arm64".into(),
                uuid: Some("ABABABAB-ABAB-ABAB-ABAB-ABABABABABAB".into())
            }]
        );
    }

    #[test]
    fn reads_fat_binary() {
        let slice = thin(0x01);
        let mut b = Vec::new();
        for v in [FAT_MAGIC, 2] {
            b.extend_from_slice(&v.to_be_bytes());
        }
        let first = 64u32;
        let second = first + slice.len() as u32;
        for (cpu, offset) in [(0x0100_0007u32, first), (0x0100_000C, second)] {
            for v in [cpu, 3, offset, slice.len() as u32, 0] {
                b.extend_from_slice(&v.to_be_bytes());
            }
        }
        b.resize(first as usize, 0);
        b.extend_from_slice(&slice);
        b.extend_from_slice(&slice);
        let archs = macho_uuids(b.as_slice()).unwrap();
        assert_eq!(archs.len(), 2);
        // The arch comes from each slice's own header.
        assert_eq!(archs[1].arch, "arm64");
    }

    #[test]
    fn rejects_other_files() {
        assert!(macho_uuids(b"hello world, not mach-o".as_slice()).is_err());
    }
}
