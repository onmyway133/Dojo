use std::fs::File;
use std::io::BufReader;

use base64::Engine;
use base64::engine::general_purpose::STANDARD;

use crate::error::{AppError, AppResult};
use crate::tools::hash::{self, Algorithm, HashOutput, HmacAlgorithm};

#[tauri::command]
pub fn hash_text(text: String) -> Vec<HashOutput> {
    hash::hash_all(text.as_bytes())
}

/// Hashes a file on a worker thread so large files don't block the app.
#[tauri::command]
pub async fn hash_file(path: String, algorithms: Vec<Algorithm>) -> AppResult<Vec<HashOutput>> {
    tauri::async_runtime::spawn_blocking(move || {
        let file = File::open(&path)?;
        Ok(hash::hash_reader(BufReader::new(file), &algorithms)?)
    })
    .await
    .map_err(|e| AppError::invalid(e.to_string()))?
}

#[derive(serde::Serialize)]
pub struct HmacOutput {
    hex: String,
    base64: String,
}

#[tauri::command]
pub fn hmac(algorithm: HmacAlgorithm, key: String, message: String) -> HmacOutput {
    let bytes = hash::hmac(algorithm, key.as_bytes(), message.as_bytes());
    HmacOutput { hex: hex::encode(&bytes), base64: STANDARD.encode(&bytes) }
}
