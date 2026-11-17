# Development

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

Local builds send no analytics: the Sumflare key is only compiled in when `SUMFLARE_APP_KEY` and
`SUMFLARE_ENDPOINT` are set at build time (see [release.md](release.md)).

## Test and build

```bash
pnpm test                    # Vitest, logic files only
pnpm build                   # typecheck and build the frontend
cd src-tauri && cargo test   # Rust unit tests
```

## Project layout

See [AGENTS.md](../AGENTS.md) for the folder layout, how to add a tool and the design system.
