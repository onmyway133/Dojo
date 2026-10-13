use rand_core::OsRng;
use rsa::pkcs8::{EncodePrivateKey, EncodePublicKey, LineEnding};
use rsa::{RsaPrivateKey, RsaPublicKey};

use crate::error::{AppError, AppResult};

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KeyPair {
    /// PKCS#8 `-----BEGIN PRIVATE KEY-----`.
    pub private_pem: String,
    /// SPKI `-----BEGIN PUBLIC KEY-----`.
    pub public_pem: String,
    pub bits: usize,
}

pub fn generate(bits: usize) -> AppResult<KeyPair> {
    if ![1024, 2048, 3072, 4096].contains(&bits) {
        return Err(AppError::invalid("Key size must be 1024, 2048, 3072 or 4096 bits"));
    }
    let private = RsaPrivateKey::new(&mut OsRng, bits).map_err(|e| AppError::invalid(e.to_string()))?;
    let public = RsaPublicKey::from(&private);
    Ok(KeyPair {
        private_pem: private
            .to_pkcs8_pem(LineEnding::LF)
            .map_err(|e| AppError::invalid(e.to_string()))?
            .to_string(),
        public_pem: public
            .to_public_key_pem(LineEnding::LF)
            .map_err(|e| AppError::invalid(e.to_string()))?,
        bits,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generates_pem_pair() {
        let pair = generate(1024).unwrap();
        assert!(pair.private_pem.starts_with("-----BEGIN PRIVATE KEY-----"));
        assert!(pair.public_pem.starts_with("-----BEGIN PUBLIC KEY-----"));
        assert!(generate(1000).is_err());
    }
}
