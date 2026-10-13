use std::io::Read;

use digest::Digest;
use hmac::{Hmac, KeyInit, Mac};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Algorithm {
    Md5,
    Sha1,
    Sha256,
    Sha384,
    Sha512,
    Sha3_256,
    Sha3_512,
}

impl Algorithm {
    pub const ALL: [Algorithm; 7] = [
        Algorithm::Md5,
        Algorithm::Sha1,
        Algorithm::Sha256,
        Algorithm::Sha384,
        Algorithm::Sha512,
        Algorithm::Sha3_256,
        Algorithm::Sha3_512,
    ];
}

#[derive(Debug, Serialize)]
pub struct HashOutput {
    pub algorithm: Algorithm,
    pub hex: String,
}

/// A running hash for any supported algorithm, so callers can stream input.
enum Hasher {
    Md5(md5::Md5),
    Sha1(sha1::Sha1),
    Sha256(sha2::Sha256),
    Sha384(sha2::Sha384),
    Sha512(sha2::Sha512),
    Sha3_256(sha3::Sha3_256),
    Sha3_512(sha3::Sha3_512),
}

impl Hasher {
    fn new(algorithm: Algorithm) -> Self {
        match algorithm {
            Algorithm::Md5 => Self::Md5(Digest::new()),
            Algorithm::Sha1 => Self::Sha1(Digest::new()),
            Algorithm::Sha256 => Self::Sha256(Digest::new()),
            Algorithm::Sha384 => Self::Sha384(Digest::new()),
            Algorithm::Sha512 => Self::Sha512(Digest::new()),
            Algorithm::Sha3_256 => Self::Sha3_256(Digest::new()),
            Algorithm::Sha3_512 => Self::Sha3_512(Digest::new()),
        }
    }

    fn update(&mut self, data: &[u8]) {
        match self {
            Self::Md5(h) => h.update(data),
            Self::Sha1(h) => h.update(data),
            Self::Sha256(h) => h.update(data),
            Self::Sha384(h) => h.update(data),
            Self::Sha512(h) => h.update(data),
            Self::Sha3_256(h) => h.update(data),
            Self::Sha3_512(h) => h.update(data),
        }
    }

    fn finish_hex(self) -> String {
        match self {
            Self::Md5(h) => hex::encode(h.finalize()),
            Self::Sha1(h) => hex::encode(h.finalize()),
            Self::Sha256(h) => hex::encode(h.finalize()),
            Self::Sha384(h) => hex::encode(h.finalize()),
            Self::Sha512(h) => hex::encode(h.finalize()),
            Self::Sha3_256(h) => hex::encode(h.finalize()),
            Self::Sha3_512(h) => hex::encode(h.finalize()),
        }
    }
}

/// Every algorithm over the same bytes.
pub fn hash_all(data: &[u8]) -> Vec<HashOutput> {
    Algorithm::ALL
        .iter()
        .map(|&algorithm| {
            let mut hasher = Hasher::new(algorithm);
            hasher.update(data);
            HashOutput { algorithm, hex: hasher.finish_hex() }
        })
        .collect()
}

/// Streams a reader once, feeding all requested algorithms in parallel.
pub fn hash_reader(mut reader: impl Read, algorithms: &[Algorithm]) -> std::io::Result<Vec<HashOutput>> {
    let mut hashers: Vec<_> = algorithms.iter().map(|&a| (a, Hasher::new(a))).collect();
    let mut buffer = vec![0u8; 1 << 16];
    loop {
        let read = reader.read(&mut buffer)?;
        if read == 0 {
            break;
        }
        for (_, hasher) in &mut hashers {
            hasher.update(&buffer[..read]);
        }
    }
    Ok(hashers
        .into_iter()
        .map(|(algorithm, hasher)| HashOutput { algorithm, hex: hasher.finish_hex() })
        .collect())
}

#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum HmacAlgorithm {
    Sha1,
    Sha256,
    Sha384,
    Sha512,
}

/// Raw HMAC bytes for `message` under `key`.
pub fn hmac(algorithm: HmacAlgorithm, key: &[u8], message: &[u8]) -> Vec<u8> {
    fn run<M: Mac + KeyInit>(key: &[u8], message: &[u8]) -> Vec<u8> {
        // HMAC accepts keys of any length, so this cannot fail.
        let mut mac = <M as KeyInit>::new_from_slice(key).expect("HMAC takes any key length");
        mac.update(message);
        mac.finalize().into_bytes().to_vec()
    }
    match algorithm {
        HmacAlgorithm::Sha1 => run::<Hmac<sha1::Sha1>>(key, message),
        HmacAlgorithm::Sha256 => run::<Hmac<sha2::Sha256>>(key, message),
        HmacAlgorithm::Sha384 => run::<Hmac<sha2::Sha384>>(key, message),
        HmacAlgorithm::Sha512 => run::<Hmac<sha2::Sha512>>(key, message),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn known_digests() {
        let out = hash_all(b"abc");
        let get = |a| out.iter().find(|o| o.algorithm == a).unwrap().hex.as_str();
        assert_eq!(get(Algorithm::Md5), "900150983cd24fb0d6963f7d28e17f72");
        assert_eq!(
            get(Algorithm::Sha256),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    }

    #[test]
    fn streaming_matches_one_shot() {
        let data = vec![7u8; 200_000];
        let streamed = hash_reader(&data[..], &[Algorithm::Sha1]).unwrap();
        let direct = hash_all(&data);
        assert_eq!(streamed[0].hex, direct[1].hex);
    }

    #[test]
    fn hmac_sha256_rfc4231_case2() {
        let mac = hmac(HmacAlgorithm::Sha256, b"Jefe", b"what do ya want for nothing?");
        assert_eq!(
            hex::encode(mac),
            "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843"
        );
    }
}
