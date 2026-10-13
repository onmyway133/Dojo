use sha1::Sha1;
use sha2::{Digest, Sha256};
use x509_parser::prelude::*;
use x509_parser::public_key::PublicKey;

use crate::error::{AppError, AppResult};

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CertificateInfo {
    pub subject: String,
    pub issuer: String,
    pub serial: String,
    pub version: u32,
    /// Unix seconds.
    pub not_before: i64,
    pub not_after: i64,
    pub subject_alt_names: Vec<String>,
    pub signature_algorithm: String,
    pub public_key: String,
    pub is_ca: bool,
    pub sha1: String,
    pub sha256: String,
}

/// Every certificate in a PEM bundle, in order (leaf first for a typical chain).
pub fn parse_pem_bundle(input: &str) -> AppResult<Vec<CertificateInfo>> {
    let mut certificates = Vec::new();
    for pem in Pem::iter_from_buffer(input.as_bytes()) {
        let pem = pem.map_err(|e| AppError::invalid(format!("Invalid PEM: {e}")))?;
        if pem.label != "CERTIFICATE" {
            continue;
        }
        certificates.push(describe(&pem.contents)?);
    }
    if certificates.is_empty() {
        return Err(AppError::invalid("No PEM certificate found. Paste text starting with -----BEGIN CERTIFICATE-----"));
    }
    Ok(certificates)
}

fn describe(der: &[u8]) -> AppResult<CertificateInfo> {
    let (_, cert) = X509Certificate::from_der(der).map_err(|e| AppError::invalid(format!("Invalid certificate: {e}")))?;

    let subject_alt_names = match cert.subject_alternative_name() {
        Ok(Some(san)) => san.value.general_names.iter().map(general_name).collect(),
        _ => Vec::new(),
    };

    Ok(CertificateInfo {
        subject: cert.subject().to_string(),
        issuer: cert.issuer().to_string(),
        serial: cert.raw_serial_as_string(),
        version: cert.version().0 + 1,
        not_before: cert.validity().not_before.timestamp(),
        not_after: cert.validity().not_after.timestamp(),
        subject_alt_names,
        signature_algorithm: oid_name(&cert.signature_algorithm.algorithm),
        public_key: public_key_description(&cert),
        is_ca: cert.is_ca(),
        sha1: fingerprint::<Sha1>(der),
        sha256: fingerprint::<Sha256>(der),
    })
}

fn general_name(name: &GeneralName) -> String {
    match name {
        GeneralName::DNSName(dns) => format!("DNS: {dns}"),
        GeneralName::RFC822Name(email) => format!("Email: {email}"),
        GeneralName::URI(uri) => format!("URI: {uri}"),
        GeneralName::IPAddress(bytes) => match bytes.len() {
            4 => format!("IP: {}", std::net::Ipv4Addr::new(bytes[0], bytes[1], bytes[2], bytes[3])),
            16 => {
                let octets: [u8; 16] = (*bytes).try_into().unwrap_or([0; 16]);
                format!("IP: {}", std::net::Ipv6Addr::from(octets))
            }
            _ => format!("IP: {}", hex::encode(bytes)),
        },
        other => format!("{other:?}"),
    }
}

fn oid_name(oid: &x509_parser::der_parser::oid::Oid) -> String {
    x509_parser::objects::oid2sn(oid, x509_parser::objects::oid_registry())
        .map(str::to_owned)
        .unwrap_or_else(|_| oid.to_id_string())
}

fn public_key_description(cert: &X509Certificate) -> String {
    let info = cert.public_key();
    let algorithm = oid_name(&info.algorithm.algorithm);
    match info.parsed() {
        Ok(PublicKey::RSA(rsa)) => format!("RSA {} bits", rsa.key_size()),
        Ok(PublicKey::EC(ec)) => format!("EC {} bits", ec.key_size()),
        _ => algorithm,
    }
}

/// Colon separated uppercase hex, the format browsers and openssl show.
fn fingerprint<D: Digest>(der: &[u8]) -> String {
    D::digest(der)
        .iter()
        .map(|b| format!("{b:02X}"))
        .collect::<Vec<_>>()
        .join(":")
}

#[cfg(test)]
mod tests {
    use super::*;

    const PEM: &str = include_str!("../../tests/fixtures/ec-cert.pem");

    #[test]
    fn parses_self_signed_certificate() {
        let certs = parse_pem_bundle(PEM).unwrap();
        assert_eq!(certs.len(), 1);
        let cert = &certs[0];
        assert!(cert.subject.contains("CN=devtools.test"));
        assert_eq!(cert.subject, cert.issuer);
        assert_eq!(cert.public_key, "EC 256 bits");
        assert!(cert.subject_alt_names.contains(&"DNS: www.devtools.test".to_string()));
        assert!(cert.subject_alt_names.contains(&"IP: 127.0.0.1".to_string()));
        // Matches `openssl x509 -noout -fingerprint -sha256`.
        assert!(cert.sha256.starts_with("E8:9E:48:92:19:BC"));
    }

    #[test]
    fn rejects_non_pem() {
        assert!(parse_pem_bundle("hello").is_err());
    }
}
