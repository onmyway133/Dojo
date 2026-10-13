use std::io::{Read, Write};

use flate2::Compression;
use flate2::read::GzDecoder;
use flate2::write::GzEncoder;

use crate::error::{AppError, AppResult};

pub fn compress(data: &[u8], level: u32) -> AppResult<Vec<u8>> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::new(level.min(9)));
    encoder.write_all(data)?;
    Ok(encoder.finish()?)
}

pub fn decompress(data: &[u8]) -> AppResult<Vec<u8>> {
    let mut out = Vec::new();
    GzDecoder::new(data)
        .read_to_end(&mut out)
        .map_err(|e| AppError::invalid(format!("Not valid GZIP data: {e}")))?;
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip() {
        let text = "hello hello hello hello".repeat(50);
        let packed = compress(text.as_bytes(), 9).unwrap();
        assert!(packed.len() < text.len());
        assert_eq!(decompress(&packed).unwrap(), text.as_bytes());
    }

    #[test]
    fn rejects_garbage() {
        assert!(decompress(b"not gzip").is_err());
    }
}
