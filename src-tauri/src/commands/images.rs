use std::path::PathBuf;

use crate::error::{AppError, AppResult};
use crate::tools::images::{self, ConvertOptions, ImageInfo, WriteResult};

async fn blocking<T: Send + 'static>(
    f: impl FnOnce() -> AppResult<T> + Send + 'static,
) -> AppResult<T> {
    tauri::async_runtime::spawn_blocking(f)
        .await
        .map_err(|e| AppError::invalid(e.to_string()))?
}

#[tauri::command]
pub async fn image_info(path: String) -> AppResult<ImageInfo> {
    blocking(move || images::info(&PathBuf::from(path))).await
}

#[tauri::command]
pub async fn convert_image(
    source: String,
    dest: String,
    options: ConvertOptions,
) -> AppResult<WriteResult> {
    blocking(move || images::convert(&PathBuf::from(source), &PathBuf::from(dest), options)).await
}

#[tauri::command]
pub async fn compress_image(
    source: String,
    dest: String,
    level: u8,
    quality: u8,
) -> AppResult<WriteResult> {
    blocking(move || images::compress(&PathBuf::from(source), &PathBuf::from(dest), level, quality))
        .await
}
