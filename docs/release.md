# Release

Dojo ships as a Developer ID signed, notarized app outside the Mac App Store, with in-app updates
through the Tauri updater. Apple Silicon only for now.

## Setup

1. Install the Developer ID Application certificate in the keychain.
2. Store a notarytool keychain profile: `xcrun notarytool store-credentials <profile>`.
3. Put the Tauri updater private key at `~/.tauri/devtools.key` (or set `TAURI_UPDATER_KEY_PATH`).
   It is not in the repo, so back it up. The matching public key is in `src-tauri/tauri.conf.json`
   under `plugins.updater.pubkey`.
4. Copy `fastlane/.env.example` to `fastlane/.env` and fill in the signing identity, notary profile
   and analytics settings. fastlane loads it automatically, and git ignores it.

## Build

```bash
fastlane deploy_standalone
```

This builds the app with Tauri, signs it with Developer ID, notarizes and staples it, and writes
`Dojo.zip`, the re-signed updater archive (`Dojo.app.tar.gz` and `.sig`) and `latest.json` to
`~/Downloads/Standalone`.

It doesn't publish anything. At the end it prints the `gh release create` command that uploads
those files to [IndieGoodies/Dojo](https://github.com/IndieGoodies/Dojo). The app's updater reads
`latest.json` from the latest release there.

To build without notarizing:

```bash
TAURI_SIGNING_PRIVATE_KEY=~/.tauri/devtools.key pnpm tauri build --bundles app
```
