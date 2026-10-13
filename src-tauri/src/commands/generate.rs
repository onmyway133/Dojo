use std::path::PathBuf;

use crate::error::{AppError, AppResult};
use crate::tools::app_icon::{self, IconSetResult, Platform};
use crate::tools::rsa_keys::{self, KeyPair};

/// RSA generation takes seconds for large keys, so it runs off the main thread.
#[tauri::command]
pub async fn generate_rsa_keys(bits: usize) -> AppResult<KeyPair> {
    tauri::async_runtime::spawn_blocking(move || rsa_keys::generate(bits))
        .await
        .map_err(|e| AppError::invalid(e.to_string()))?
}

#[tauri::command]
pub async fn generate_app_icon(
    source: String,
    output_dir: String,
    platforms: Vec<Platform>,
) -> AppResult<IconSetResult> {
    tauri::async_runtime::spawn_blocking(move || {
        app_icon::generate(
            &PathBuf::from(source),
            &PathBuf::from(output_dir),
            &platforms,
        )
    })
    .await
    .map_err(|e| AppError::invalid(e.to_string()))?
}
