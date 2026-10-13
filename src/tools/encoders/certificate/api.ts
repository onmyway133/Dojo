import { call } from "@/lib/invoke";

export interface CertificateInfo {
  subject: string;
  issuer: string;
  serial: string;
  version: number;
  notBefore: number;
  notAfter: number;
  subjectAltNames: string[];
  signatureAlgorithm: string;
  publicKey: string;
  isCa: boolean;
  sha1: string;
  sha256: string;
}

export const parseCertificates = (pem: string) => call<CertificateInfo[]>("parse_certificates", { pem });

/** The CN of a distinguished name, falling back to the whole name. */
export const commonName = (dn: string) => /CN=([^,]+)/.exec(dn)?.[1] ?? dn;
