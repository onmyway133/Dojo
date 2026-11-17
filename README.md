# Dojo

Developer tools for macOS, built with Tauri 2 (Rust) and React 19.

Releases and the download live in [IndieGoodies/Dojo](https://github.com/IndieGoodies/Dojo).
This repo holds the code.

## Requirements

- macOS 13 or later
- Node.js 24 (pinned in `package.json` for Volta) and pnpm 10. Vite needs Node 20.19+ or 22.12+.
- Rust 1.89 (`cargo`) and the Xcode command line tools (`xcode-select --install`)

## Run locally

```bash
pnpm install
pnpm tauri dev
```

`pnpm tauri dev` starts the Vite dev server on port 1420 and opens the app. Frontend changes reload
live; Rust changes rebuild the app.

To work on the frontend only in a browser, run `pnpm dev` and open http://localhost:1420.
Tools that call Rust commands or native APIs (clipboard, files, updater) only work in the app.

If a Tailwind class in a newly created file doesn't apply, restart the dev server.

## Test and build

```bash
pnpm test                    # Vitest, logic files only
pnpm build                   # typecheck and build the frontend
cd src-tauri && cargo test   # Rust unit tests
```

## Release

```bash
fastlane deploy_standalone
```

Builds the app, signs it with Developer ID, notarizes and staples it, and writes `Dojo.zip`,
the updater archive with its signature, and `latest.json` to `~/Downloads/Standalone`. It needs
the Developer ID certificate in the keychain, a notarytool keychain profile, and the updater key
at `~/.tauri/devtools.key`. Copy `fastlane/.env.example` to `fastlane/.env` and fill in the signing
identity, notary profile and analytics settings; fastlane loads it automatically. It then prints the `gh release create` command that
publishes to IndieGoodies/Dojo.

## Project layout

See [AGENTS.md](AGENTS.md) for the folder layout, how to add a tool and the design system.
