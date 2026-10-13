use std::path::Path;

use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use tauri::ipc::Response;

use crate::error::{AppError, AppResult};

/// File contents as a raw binary response (an ArrayBuffer in JS, no base64 overhead).
#[tauri::command]
pub async fn read_file(path: String) -> AppResult<Response> {
    let bytes = tauri::async_runtime::spawn_blocking(move || std::fs::read(path))
        .await
        .map_err(|e| AppError::invalid(e.to_string()))??;
    Ok(Response::new(bytes))
}

/// Writes base64 data chosen by the user through a save dialog.
#[tauri::command]
pub fn write_file(path: String, base64: String) -> AppResult<()> {
    let bytes = STANDARD
        .decode(base64.as_bytes())
        .map_err(|e| AppError::invalid(format!("Invalid file data: {e}")))?;
    std::fs::write(path, bytes)?;
    Ok(())
}

#[derive(serde::Serialize)]
pub struct FileInfo {
    name: String,
    size: u64,
}

#[tauri::command]
pub fn file_info(path: String) -> AppResult<FileInfo> {
    let metadata = std::fs::metadata(&path)?;
    let name = Path::new(&path)
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_default();
    Ok(FileInfo {
        name,
        size: metadata.len(),
    })
}
