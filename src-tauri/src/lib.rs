mod commands;
mod error;
mod menu;
mod sumflare;
mod tools;
mod window;

#[cfg(debug_assertions)]
mod dev {
    use tauri::Manager;

    /// Debug builds only: evaluates `DEVTOOLS_DEV_SCRIPT` in the main window shortly after
    /// launch, so UI checks can seed state and navigate without synthetic key events.
    pub fn run_dev_script(app: &tauri::App) {
        let Ok(script) = std::env::var("DEVTOOLS_DEV_SCRIPT") else {
            return;
        };
        let Some(window) = app.get_webview_window("main") else {
            return;
        };
        std::thread::spawn(move || {
            std::thread::sleep(std::time::Duration::from_secs(3));
            let _ = window.eval(&script);
        });
    }
}

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_autostart::Builder::new().build())
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
            commands::apple::decode_profile_file,
            commands::apple::plist_to_json,
            commands::apple::json_to_plist,
            commands::apple::plist_file_to_xml,
            commands::apple::macho_uuids,
            commands::generate::generate_rsa_keys,
            commands::generate::generate_app_icon,
            commands::generate::bcrypt_hash,
            commands::generate::bcrypt_verify,
            commands::images::image_info,
            commands::images::convert_image,
            commands::images::compress_image,
            commands::network::public_ip,
            commands::network::ip_details,
            commands::network::local_addresses,
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            dev::run_dev_script(app);
            if let Some(main) = app.get_webview_window("main") {
                window::fit_titlebar_to_traffic_lights(main.ns_window());
            }
            sumflare::signal(app.handle());
            Ok(())
        })
        .menu(|app| menu::build(app))
        .on_menu_event(|app, event| menu::handle(app, event.id().as_ref()))
        .on_window_event(|window, event| {
            // AppKit stretches the title bar container again on every resize.
            match event {
                tauri::WindowEvent::Resized(_) => window::fit_titlebar_to_traffic_lights(window.ns_window()),
                tauri::WindowEvent::Focused(true) => sumflare::signal(window.app_handle()),
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
