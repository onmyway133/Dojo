//! macOS window chrome tweaks.

/// With an inset traffic-light position, the native title bar container is resized to
/// the full window width and the inset height. That transparent view sits above the web
/// content and swallows clicks on toolbar buttons. Narrow it to the traffic lights so the
/// rest of the toolbar is web content again (dragging uses `data-tauri-drag-region`).
#[cfg(target_os = "macos")]
pub fn fit_titlebar_to_traffic_lights(ns_window: tauri::Result<*mut std::ffi::c_void>) {
    use objc2_app_kit::{NSWindow, NSWindowButton};

    let Ok(pointer) = ns_window else { return };
    // SAFETY: Tauri hands back the live NSWindow of the window, and window callbacks
    // and setup run on the main thread.
    let ns_window = unsafe { &*(pointer as *const NSWindow) };
    let (Some(close), Some(zoom)) = (
        ns_window.standardWindowButton(NSWindowButton::CloseButton),
        ns_window.standardWindowButton(NSWindowButton::ZoomButton),
    ) else {
        return;
    };
    // close button -> NSTitlebarView -> NSTitlebarContainerView
    let Some(container) =
        (unsafe { close.superview() }).and_then(|view| unsafe { view.superview() })
    else {
        return;
    };
    let zoom_frame = zoom.frame();
    let mut frame = container.frame();
    frame.size.width = zoom_frame.origin.x + zoom_frame.size.width + 12.0;
    container.setFrame(frame);
}

#[cfg(not(target_os = "macos"))]
pub fn fit_titlebar_to_traffic_lights<T>(_ns_window: T) {}
