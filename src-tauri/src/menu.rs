//! The native macOS menu bar. Custom items are forwarded to the web app as a `menu` event
//! carrying the item id, so the frontend owns navigation.

use tauri::menu::{AboutMetadata, Menu, MenuItemBuilder, SubmenuBuilder};
use tauri::{AppHandle, Emitter, Runtime};

pub const SETTINGS: &str = "settings";
pub const HOME: &str = "home";
pub const OPEN_TOOL: &str = "open-tool";
pub const FIND: &str = "find";
pub const GITHUB: &str = "github";

pub fn build<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let settings = MenuItemBuilder::with_id(SETTINGS, "Settings…").accelerator("CmdOrCtrl+,").build(app)?;
    let home = MenuItemBuilder::with_id(HOME, "All Tools").accelerator("CmdOrCtrl+0").build(app)?;
    let open_tool = MenuItemBuilder::with_id(OPEN_TOOL, "Open Tool…").accelerator("CmdOrCtrl+K").build(app)?;
    let find = MenuItemBuilder::with_id(FIND, "Search Tools").accelerator("CmdOrCtrl+Shift+F").build(app)?;
    let github = MenuItemBuilder::with_id(GITHUB, "DevTools on GitHub").build(app)?;

    let app_menu = SubmenuBuilder::new(app, "DevTools")
        .about(Some(AboutMetadata { name: Some("DevTools".into()), ..Default::default() }))
        .separator()
        .item(&settings)
        .separator()
        .services()
        .separator()
        .hide()
        .hide_others()
        .show_all()
        .separator()
        .quit()
        .build()?;
    let edit = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;
    let view = SubmenuBuilder::new(app, "View")
        .item(&home)
        .item(&open_tool)
        .item(&find)
        .separator()
        .fullscreen()
        .build()?;
    let window = SubmenuBuilder::new(app, "Window")
        .minimize()
        .maximize()
        .separator()
        .close_window()
        .separator()
        .bring_all_to_front()
        .build()?;
    let help = SubmenuBuilder::new(app, "Help").item(&github).build()?;

    Menu::with_items(app, &[&app_menu, &edit, &view, &window, &help])
}

/// Forwards custom items to the frontend; predefined items handle themselves.
pub fn handle<R: Runtime>(app: &AppHandle<R>, id: &str) {
    if [SETTINGS, HOME, OPEN_TOOL, FIND, GITHUB].contains(&id) {
        let _ = app.emit("menu", id);
    }
}
