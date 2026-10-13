use base64::Engine;
use base64::engine::general_purpose::STANDARD;

use crate::error::{AppError, AppResult};
use crate::tools::{certificate, gzip};

/// GZIP-compresses UTF-8 text and returns base64.
#[tauri::command]
pub fn gzip_compress(text: String, level: u32) -> AppResult<String> {
    Ok(STANDARD.encode(gzip::compress(text.as_bytes(), level)?))
}

/// Decompresses base64 GZIP data back to UTF-8 text.
#[tauri::command]
pub fn gzip_decompress(base64: String) -> AppResult<String> {
    let clean: String = base64.split_whitespace().collect();
    let data = STANDARD
        .decode(clean.as_bytes())
        .map_err(|e| AppError::invalid(format!("Invalid base64: {e}")))?;
    let bytes = gzip::decompress(&data)?;
    String::from_utf8(bytes).map_err(|_| AppError::invalid("Decompressed data is not UTF-8 text"))
}

#[tauri::command]
pub fn parse_certificates(pem: String) -> AppResult<Vec<certificate::CertificateInfo>> {
    certificate::parse_pem_bundle(&pem)
}
