use crate::error::AppResult;
use crate::tools::convert;

#[tauri::command]
pub fn json_to_toml(input: String) -> AppResult<String> {
    convert::json_to_toml(&input)
}

#[tauri::command]
pub fn toml_to_json(input: String, indent: usize) -> AppResult<String> {
    convert::toml_to_json(&input, indent)
}
