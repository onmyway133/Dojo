import { call } from "@/lib/invoke";

export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha384" | "sha512" | "sha3-256" | "sha3-512";

export interface HashOutput {
  algorithm: HashAlgorithm;
  hex: string;
}

export const hashAlgorithmNames: Record<HashAlgorithm, string> = {
  md5: "MD5",
  sha1: "SHA-1",
  sha256: "SHA-256",
  sha384: "SHA-384",
  sha512: "SHA-512",
  "sha3-256": "SHA3-256",
  "sha3-512": "SHA3-512",
};

export const allHashAlgorithms = Object.keys(hashAlgorithmNames) as HashAlgorithm[];

export const hashText = (text: string) => call<HashOutput[]>("hash_text", { text });

export const hashFile = (path: string, algorithms: HashAlgorithm[]) =>
  call<HashOutput[]>("hash_file", { path, algorithms });
