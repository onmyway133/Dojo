use base64::Engine;
use base64::engine::general_purpose::STANDARD;

use crate::error::{AppError, AppResult};
use crate::tools::apple;

/// Decodes a provisioning profile file.
#[tauri::command]
pub async fn decode_profile_file(path: String) -> AppResult<apple::ProfileInfo> {
    let bytes = std::fs::read(path)?;
    apple::decode_profile(&bytes)
}

/// XML plist text to pretty JSON.
#[tauri::command]
pub fn plist_to_json(text: String) -> AppResult<String> {
    apple::plist_to_json(text.as_bytes())
}

#[tauri::command]
pub fn json_to_plist(json: String) -> AppResult<String> {
    apple::json_to_plist(&json)
}

/// A plist file's bytes (base64, binary or XML) as XML text.
#[tauri::command]
pub fn plist_file_to_xml(base64: String) -> AppResult<String> {
    let bytes = STANDARD
        .decode(base64.as_bytes())
        .map_err(|e| AppError::invalid(format!("Invalid file data: {e}")))?;
    apple::plist_to_xml(&bytes)
}

/// LC_UUID of each architecture in a binary, or in the executable of a dropped bundle.
#[tauri::command]
pub async fn macho_uuids(path: String) -> AppResult<apple::MachOInfo> {
    tauri::async_runtime::spawn_blocking(move || apple::macho_file(std::path::Path::new(&path)))
        .await
        .map_err(|e| AppError::invalid(e.to_string()))?
}
