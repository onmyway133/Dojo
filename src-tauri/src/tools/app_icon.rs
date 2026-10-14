use std::path::{Path, PathBuf};

use image::imageops::FilterType;
use image::{DynamicImage, GenericImageView};
use serde_json::json;

use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Copy, serde::Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Platform {
    Macos,
    Ios,
}

struct Slot {
    /// Point size, e.g. 16 for "16x16".
    points: u32,
    scale: u32,
    idiom: &'static str,
    platform: Option<&'static str>,
}

fn slots(platform: Platform) -> Vec<Slot> {
    match platform {
        Platform::Macos => [16, 32, 128, 256, 512]
            .into_iter()
            .flat_map(|points| {
                [1, 2].map(|scale| Slot {
                    points,
                    scale,
                    idiom: "mac",
                    platform: None,
                })
            })
            .collect(),
        // Xcode 14+ takes a single 1024pt image and derives the rest.
        Platform::Ios => vec![Slot {
            points: 1024,
            scale: 1,
            idiom: "universal",
            platform: Some("ios"),
        }],
    }
}

fn file_name(slot: &Slot) -> String {
    let base = format!("icon_{0}x{0}", slot.points);
    match (slot.platform, slot.scale) {
        (Some(platform), _) => format!("{base}_{platform}.png"),
        (None, 1) => format!("{base}.png"),
        (None, scale) => format!("{base}@{scale}x.png"),
    }
}

/// Crops the image to a centred square so non-square sources don't get stretched.
fn square(image: DynamicImage) -> DynamicImage {
    let (w, h) = image.dimensions();
    let side = w.min(h);
    image.crop_imm((w - side) / 2, (h - side) / 2, side, side)
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IconSetResult {
    pub folder: String,
    pub files: Vec<String>,
    /// Shown when the source is smaller than the largest icon.
    pub warning: Option<String>,
}

/// Writes `AppIcon.appiconset` (PNG files + Contents.json) into `output_dir`.
pub fn generate(
    source: &Path,
    output_dir: &Path,
    platforms: &[Platform],
) -> AppResult<IconSetResult> {
    if platforms.is_empty() {
        return Err(AppError::invalid("Choose at least one platform"));
    }
    let image =
        image::open(source).map_err(|e| AppError::invalid(format!("Can't read the image: {e}")))?;
    let image = square(image);
    let side = image.width();

    let folder: PathBuf = output_dir.join("AppIcon.appiconset");
    std::fs::create_dir_all(&folder)?;

    let mut images = Vec::new();
    let mut files = Vec::new();
    for platform in platforms {
        for slot in slots(*platform) {
            let pixels = slot.points * slot.scale;
            let name = file_name(&slot);
            image
                .resize_exact(pixels, pixels, FilterType::Lanczos3)
                .save(folder.join(&name))
                .map_err(|e| AppError::invalid(format!("Couldn't write {name}: {e}")))?;
            let mut entry = json!({
                "filename": name,
                "idiom": slot.idiom,
                "size": format!("{0}x{0}", slot.points),
            });
            if let Some(platform) = slot.platform {
                entry["platform"] = json!(platform);
            } else {
                entry["scale"] = json!(format!("{}x", slot.scale));
            }
            images.push(entry);
            files.push(name);
        }
    }

    let contents = json!({ "images": images, "info": { "author": "xcode", "version": 1 } });
    std::fs::write(
        folder.join("Contents.json"),
        serde_json::to_string_pretty(&contents).map_err(|e| AppError::invalid(e.to_string()))?,
    )?;
    files.push("Contents.json".into());

    Ok(IconSetResult {
        folder: folder.to_string_lossy().into_owned(),
        files,
        warning: (side < 1024).then(|| {
            format!("The source is {side}×{side}; use 1024×1024 or larger for sharp icons.")
        }),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn writes_mac_and_ios_icon_set() {
        let dir = std::env::temp_dir().join(format!("dojo-icon-test-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let source = dir.join("source.png");
        DynamicImage::new_rgba8(300, 200).save(&source).unwrap();

        let result = generate(&source, &dir, &[Platform::Macos, Platform::Ios]).unwrap();
        assert_eq!(result.files.len(), 12); // 10 mac + 1 iOS + Contents.json
        assert!(result.warning.is_some());
        let big = image::open(dir.join("AppIcon.appiconset/icon_512x512@2x.png")).unwrap();
        assert_eq!(big.dimensions(), (1024, 1024));
        let contents =
            std::fs::read_to_string(dir.join("AppIcon.appiconset/Contents.json")).unwrap();
        assert!(contents.contains("\"idiom\": \"universal\""));
        std::fs::remove_dir_all(dir).unwrap();
    }
}
