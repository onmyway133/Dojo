mod commands;
mod error;
mod tools;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::hash::hash_text,
            commands::hash::hash_file,
            commands::hash::hmac,
            commands::convert::json_to_toml,
            commands::convert::toml_to_json,
            commands::files::read_file,
            commands::files::write_file,
            commands::files::file_info,
            commands::encode::gzip_compress,
            commands::encode::gzip_decompress,
            commands::encode::parse_certificates,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
