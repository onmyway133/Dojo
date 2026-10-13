mod commands;
mod error;
mod tools;

#[cfg(debug_assertions)]
mod dev {
    use tauri::Manager;

    /// Debug builds only: evaluates `DEVTOOLS_DEV_SCRIPT` in the main window shortly after
    /// launch, so UI checks can seed state and navigate without synthetic key events.
    pub fn run_dev_script(app: &tauri::App) {
        let Ok(script) = std::env::var("DEVTOOLS_DEV_SCRIPT") else { return };
        let Some(window) = app.get_webview_window("main") else { return };
        std::thread::spawn(move || {
            std::thread::sleep(std::time::Duration::from_secs(3));
            let _ = window.eval(&script);
        });
    }
}

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
        .setup(|app| {
            #[cfg(debug_assertions)]
            dev::run_dev_script(app);
            let _ = app;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
