import { expect, it } from "vitest";
import { wifiPayload } from "./logic";

it("escapes special characters and omits the password on open networks", () => {
  expect(wifiPayload({ ssid: 'Cafe;"5G"', password: "a:b\\c", security: "WPA", hidden: true })).toBe(
    'WIFI:T:WPA;S:Cafe\;\\"5G\\";P:a\\:b\\\\c;H:true;;',
  );
  expect(wifiPayload({ ssid: "Guest", password: "x", security: "nopass", hidden: false })).toBe("WIFI:T:nopass;S:Guest;;");
});
