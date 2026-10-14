use std::time::Duration;

use serde::Serialize;

use crate::error::{AppError, AppResult};

fn client() -> AppResult<reqwest::Client> {
    reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .user_agent(concat!("Dojo/", env!("CARGO_PKG_VERSION")))
        .build()
        .map_err(|e| AppError::invalid(e.to_string()))
}

fn network_error(e: reqwest::Error) -> AppError {
    AppError::invalid(format!("Network request failed: {e}"))
}

/// Public address as seen from the internet (IPv6 when available, else IPv4).
pub async fn public_ip() -> AppResult<String> {
    #[derive(serde::Deserialize)]
    struct Response {
        ip: String,
    }
    let response: Response = client()?
        .get("https://api64.ipify.org?format=json")
        .send()
        .await
        .map_err(network_error)?
        .error_for_status()
        .map_err(network_error)?
        .json()
        .await
        .map_err(network_error)?;
    Ok(response.ip)
}

#[derive(Debug, Default, Serialize, serde::Deserialize)]
#[serde(default)]
pub struct IpDetails {
    pub ip: String,
    pub city: Option<String>,
    pub region: Option<String>,
    pub country_name: Option<String>,
    pub postal: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub timezone: Option<String>,
    pub org: Option<String>,
    pub asn: Option<String>,
}

/// Approximate location and network owner for an address, from ipapi.co.
pub async fn ip_details(ip: &str) -> AppResult<IpDetails> {
    if ip.parse::<std::net::IpAddr>().is_err() {
        return Err(AppError::invalid("Not a valid IP address"));
    }
    client()?
        .get(format!("https://ipapi.co/{ip}/json/"))
        .send()
        .await
        .map_err(network_error)?
        .error_for_status()
        .map_err(network_error)?
        .json()
        .await
        .map_err(network_error)
}

#[derive(Debug, Serialize)]
pub struct LocalAddress {
    pub interface: String,
    pub address: String,
    pub ipv6: bool,
}

/// Addresses of this Mac's network interfaces, without loopback.
pub fn local_addresses() -> AppResult<Vec<LocalAddress>> {
    let mut list: Vec<LocalAddress> = if_addrs::get_if_addrs()?
        .into_iter()
        .filter(|i| !i.is_loopback())
        .map(|i| LocalAddress {
            address: i.ip().to_string(),
            ipv6: i.ip().is_ipv6(),
            interface: i.name,
        })
        .collect();
    list.sort_by(|a, b| a.ipv6.cmp(&b.ipv6).then(a.interface.cmp(&b.interface)));
    Ok(list)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lists_local_addresses_without_loopback() {
        let list = local_addresses().unwrap();
        assert!(
            list.iter()
                .all(|a| a.address != "127.0.0.1" && a.address != "::1")
        );
    }
}
