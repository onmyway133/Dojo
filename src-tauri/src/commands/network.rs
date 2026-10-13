use crate::error::AppResult;
use crate::tools::network::{self, IpDetails, LocalAddress};

#[tauri::command]
pub async fn public_ip() -> AppResult<String> {
    network::public_ip().await
}

#[tauri::command]
pub async fn ip_details(ip: String) -> AppResult<IpDetails> {
    network::ip_details(&ip).await
}

#[tauri::command]
pub fn local_addresses() -> AppResult<Vec<LocalAddress>> {
    network::local_addresses()
}
