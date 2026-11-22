use crate::error::AppResult;
use crate::tools::apple;

/// Decodes a provisioning profile file.
#[tauri::command]
pub async fn decode_profile_file(path: String) -> AppResult<apple::ProfileInfo> {
    let bytes = std::fs::read(path)?;
    apple::decode_profile(&bytes)
}
