import { call } from "@/lib/invoke";
import type { CertificateInfo } from "@/tools/encoders/certificate/api";

export interface ProfileInfo {
  name?: string;
  appIdName?: string;
  applicationIdentifier?: string;
  bundleId?: string;
  teamName?: string;
  teamIds: string[];
  platforms: string[];
  uuid?: string;
  /** Unix seconds. */
  creationDate?: number;
  expirationDate?: number;
  kind: string;
  xcodeManaged: boolean;
  provisionsAllDevices: boolean;
  devices: string[];
  entitlements: Record<string, unknown>;
  certificates: CertificateInfo[];
  raw: Record<string, unknown>;
}

export const decodeProfileFile = (path: string) => call<ProfileInfo>("decode_profile_file", { path });
