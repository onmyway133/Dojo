use std::io::Cursor;
use std::path::Path;

use image::codecs::jpeg::JpegEncoder;
use image::imageops::FilterType;
use image::{DynamicImage, ImageFormat, ImageReader};

use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Copy, serde::Deserialize, serde::Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum OutputFormat {
    Png,
    Jpeg,
    Webp,
    Bmp,
    Tiff,
    Gif,
    Ico,
}

impl OutputFormat {
    fn image_format(self) -> ImageFormat {
        match self {
            Self::Png => ImageFormat::Png,
            Self::Jpeg => ImageFormat::Jpeg,
            Self::Webp => ImageFormat::WebP,
            Self::Bmp => ImageFormat::Bmp,
            Self::Tiff => ImageFormat::Tiff,
            Self::Gif => ImageFormat::Gif,
            Self::Ico => ImageFormat::Ico,
        }
    }
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageInfo {
    pub width: u32,
    pub height: u32,
    pub format: String,
    pub bytes: u64,
}

fn open(path: &Path) -> AppResult<(DynamicImage, Option<ImageFormat>)> {
    let reader = ImageReader::open(path)?
        .with_guessed_format()
        .map_err(|e| AppError::invalid(e.to_string()))?;
    let format = reader.format();
    let image = reader
        .decode()
        .map_err(|e| AppError::invalid(format!("Can't decode the image: {e}")))?;
    Ok((image, format))
}

pub fn info(path: &Path) -> AppResult<ImageInfo> {
    let (image, format) = open(path)?;
    Ok(ImageInfo {
        width: image.width(),
        height: image.height(),
        format: format
            .map(|f| format!("{f:?}").to_uppercase())
            .unwrap_or_else(|| "Unknown".into()),
        bytes: std::fs::metadata(path)?.len(),
    })
}

/// Encodes in memory. JPEG drops alpha (it has none) and honours `quality` (1–100).
fn encode(image: &DynamicImage, format: OutputFormat, quality: u8) -> AppResult<Vec<u8>> {
    let mut out = Cursor::new(Vec::new());
    match format {
        OutputFormat::Jpeg => {
            let encoder = JpegEncoder::new_with_quality(&mut out, quality.clamp(1, 100));
            DynamicImage::ImageRgb8(image.to_rgb8())
                .write_with_encoder(encoder)
                .map_err(|e| AppError::invalid(e.to_string()))?;
        }
        OutputFormat::Ico if image.width() > 256 || image.height() > 256 => {
            return Err(AppError::invalid(
                "ICO images can be at most 256×256; resize first",
            ));
        }
        other => image
            .write_to(&mut out, other.image_format())
            .map_err(|e| AppError::invalid(e.to_string()))?,
    }
    Ok(out.into_inner())
}

#[derive(Debug, Clone, Copy, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConvertOptions {
    pub format: OutputFormat,
    /// Target width/height in pixels. One alone keeps the aspect ratio.
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub quality: u8,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WriteResult {
    pub width: u32,
    pub height: u32,
    pub bytes_before: u64,
    pub bytes_after: u64,
}

pub fn convert(source: &Path, dest: &Path, options: ConvertOptions) -> AppResult<WriteResult> {
    let (image, _) = open(source)?;
    let resized = match (options.width, options.height) {
        (Some(w), Some(h)) => image.resize_exact(w.max(1), h.max(1), FilterType::Lanczos3),
        (Some(w), None) => image.resize(w.max(1), u32::MAX, FilterType::Lanczos3),
        (None, Some(h)) => image.resize(u32::MAX, h.max(1), FilterType::Lanczos3),
        (None, None) => image,
    };
    let data = encode(&resized, options.format, options.quality)?;
    std::fs::write(dest, &data)?;
    Ok(WriteResult {
        width: resized.width(),
        height: resized.height(),
        bytes_before: std::fs::metadata(source)?.len(),
        bytes_after: data.len() as u64,
    })
}

/// Lossless PNG optimisation (oxipng, `level` 1–6) or JPEG re-encode at `quality`.
pub fn compress(source: &Path, dest: &Path, level: u8, quality: u8) -> AppResult<WriteResult> {
    let original = std::fs::read(source)?;
    let (image, format) = open(source)?;
    let data = match format {
        Some(ImageFormat::Png) => {
            let options = oxipng::Options::from_preset(level.clamp(1, 6));
            oxipng::optimize_from_memory(&original, &options)
                .map_err(|e| AppError::invalid(e.to_string()))?
        }
        Some(ImageFormat::Jpeg) => encode(&image, OutputFormat::Jpeg, quality)?,
        _ => {
            return Err(AppError::invalid(
                "Compression supports PNG and JPEG images",
            ));
        }
    };
    // Never write a bigger file than the original.
    let data = if data.len() < original.len() {
        data
    } else {
        original.clone()
    };
    std::fs::write(dest, &data)?;
    Ok(WriteResult {
        width: image.width(),
        height: image.height(),
        bytes_before: original.len() as u64,
        bytes_after: data.len() as u64,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample(dir: &Path) -> std::path::PathBuf {
        let path = dir.join("sample.png");
        let image = image::RgbaImage::from_fn(64, 32, |x, y| {
            image::Rgba([(x * 4) as u8, (y * 8) as u8, 128, 255])
        });
        image.save(&path).unwrap();
        path
    }

    #[test]
    fn converts_resizes_and_compresses() {
        let dir = std::env::temp_dir().join(format!("dojo-images-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let source = sample(&dir);

        let jpeg = dir.join("out.jpg");
        let result = convert(
            &source,
            &jpeg,
            ConvertOptions {
                format: OutputFormat::Jpeg,
                width: Some(32),
                height: None,
                quality: 80,
            },
        )
        .unwrap();
        assert_eq!((result.width, result.height), (32, 16));
        assert_eq!(info(&jpeg).unwrap().format, "JPEG");

        let small = dir.join("small.png");
        let result = compress(&source, &small, 2, 80).unwrap();
        assert!(result.bytes_after <= result.bytes_before);

        assert!(
            convert(
                &source,
                &dir.join("x.ico"),
                ConvertOptions {
                    format: OutputFormat::Ico,
                    width: Some(300),
                    height: None,
                    quality: 80
                }
            )
            .is_err()
        );
        std::fs::remove_dir_all(dir).unwrap();
    }
}
