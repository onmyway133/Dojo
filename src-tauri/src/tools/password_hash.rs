use crate::error::{AppError, AppResult};

/// bcrypt hash with a random salt. `cost` is the log2 work factor (4–15 here).
pub fn bcrypt_hash(password: &str, cost: u32) -> AppResult<String> {
    if !(4..=15).contains(&cost) {
        return Err(AppError::invalid("Cost must be between 4 and 15"));
    }
    bcrypt::hash(password, cost).map_err(|e| AppError::invalid(e.to_string()))
}

/// Whether `password` matches a `$2a$`/`$2b$`/`$2y$` hash.
pub fn bcrypt_verify(password: &str, hash: &str) -> AppResult<bool> {
    bcrypt::verify(password, hash.trim()).map_err(|e| AppError::invalid(format!("Not a valid bcrypt hash: {e}")))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hashes_and_verifies() {
        let hash = bcrypt_hash("hunter2", 4).unwrap();
        assert!(hash.starts_with("$2b$04$"));
        assert!(bcrypt_verify("hunter2", &hash).unwrap());
        assert!(!bcrypt_verify("hunter3", &hash).unwrap());
        assert!(bcrypt_verify("x", "not a hash").is_err());
        assert!(bcrypt_hash("x", 20).is_err());
    }
}
