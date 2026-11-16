//! Counts daily active users in our Sumflare install, the same way the Sumflare Swift SDK does:
//! one signal on launch and when the app becomes active, at most once per UTC day. Each install
//! gets a random ID that stays on this Mac; nothing else about the user is sent.

use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use rand_core::{OsRng, RngCore};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

const APP_KEY: &str = "SUMFLARE_APP_KEY_REMOVED";
const ENDPOINT: &str = "https://indiegoodies.sumflare.com/api/signal";

static IS_SENDING: AtomicBool = AtomicBool::new(false);

#[derive(Default, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
struct State {
    user_id: String,
    last_sent_day: String,
}

/// Sends today's signal if it hasn't been sent yet. Safe to call on every launch and focus.
pub fn signal(app: &AppHandle) {
    let Ok(dir) = app.path().app_data_dir() else {
        return;
    };
    let path = dir.join("sumflare.json");
    let mut state = load(&path);
    let today = utc_day(SystemTime::now());
    if state.last_sent_day == today || IS_SENDING.swap(true, Ordering::SeqCst) {
        return;
    }
    if state.user_id.is_empty() {
        state.user_id = random_id();
        save(&path, &state);
    }
    let version = app.package_info().version.to_string();
    tauri::async_runtime::spawn(async move {
        let is_sent = send(&state.user_id, &version).await;
        // Only remember the day after the server accepted it, so a failed send retries later.
        if is_sent {
            state.last_sent_day = today;
            save(&path, &state);
        }
        IS_SENDING.store(false, Ordering::SeqCst);
    });
}

async fn send(user_id: &str, app_version: &str) -> bool {
    let Ok(client) = reqwest::Client::builder().timeout(Duration::from_secs(10)).build() else {
        return false;
    };
    let body = serde_json::json!({
        "appKey": APP_KEY,
        "userId": user_id,
        "appVersion": app_version,
        "osVersion": os_version(),
        "platform": "macOS",
    });
    match client.post(ENDPOINT).json(&body).send().await {
        Ok(response) => response.status().as_u16() == 202,
        Err(_) => false,
    }
}

fn load(path: &PathBuf) -> State {
    std::fs::read(path)
        .ok()
        .and_then(|data| serde_json::from_slice(&data).ok())
        .unwrap_or_default()
}

fn save(path: &PathBuf, state: &State) {
    if let Some(dir) = path.parent() {
        let _ = std::fs::create_dir_all(dir);
    }
    if let Ok(data) = serde_json::to_vec(state) {
        let _ = std::fs::write(path, data);
    }
}

fn random_id() -> String {
    let mut bytes = [0u8; 16];
    OsRng.fill_bytes(&mut bytes);
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

/// macOS version as "major.minor", read from the system version file.
fn os_version() -> String {
    let Ok(plist) = std::fs::read_to_string("/System/Library/CoreServices/SystemVersion.plist") else {
        return String::new();
    };
    let Some(rest) = plist.split("<key>ProductVersion</key>").nth(1) else {
        return String::new();
    };
    let value = rest
        .split("<string>")
        .nth(1)
        .and_then(|s| s.split("</string>").next())
        .unwrap_or("");
    value.split('.').take(2).collect::<Vec<_>>().join(".")
}

/// The UTC calendar day as YYYY-MM-DD.
fn utc_day(time: SystemTime) -> String {
    let days = time.duration_since(UNIX_EPOCH).map(|d| d.as_secs() / 86_400).unwrap_or(0) as i64;
    // Days since 1970-01-01 to a civil date (Howard Hinnant's days_from_civil, inverted).
    let z = days + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = if mp < 10 { mp + 3 } else { mp - 9 };
    let year = yoe + era * 400 + i64::from(month <= 2);
    format!("{year:04}-{month:02}-{day:02}")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn formats_utc_day() {
        assert_eq!(utc_day(UNIX_EPOCH), "1970-01-01");
        // 2026-11-16 00:00:00 UTC
        assert_eq!(utc_day(UNIX_EPOCH + Duration::from_secs(1_794_787_200)), "2026-11-16");
        // 2024-02-29 12:00:00 UTC
        assert_eq!(utc_day(UNIX_EPOCH + Duration::from_secs(1_709_208_000)), "2024-02-29");
    }
}
