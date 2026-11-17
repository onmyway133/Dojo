# Contributing to Dojo

Thanks for helping out. Bug reports, fixes and new tools are all welcome.

- **Bugs and ideas:** open an issue with steps to reproduce, or the tool you'd like and why.
- **Pull requests:** keep them small and focused, one tool or fix per PR. For a bigger change,
  open an issue first so we can agree on the approach.

See [docs/development.md](docs/development.md) to set up and run the app.

## Before you open a PR

```bash
pnpm test                    # Vitest, logic files only
pnpm build                   # typecheck and build the frontend
cd src-tauri && cargo test   # Rust unit tests
```

Check the tool in both light and dark mode.

## Stack

Tauri 2 (Rust) backend, React 19 + TypeScript + Vite frontend, Tailwind v4 and shadcn/ui
(radix-nova style) for UI, CodeMirror 6 for code editing.

## Layout

```
src/
  app/                App, router, providers
  components/ui/      shadcn primitives (generated, keep edits small)
  components/layout/  sidebar, command menu, window chrome
  components/tool/    ToolPage, ToolSection, CopyButton, CodeEditor, ...
  features/home/      home grid
  tools/<category>/<tool-id>/  meta.ts, Tool.tsx, logic.ts, logic.test.ts
  tools/registry.ts   discovers every meta.ts, lazy-loads Tool.tsx
  lib/                utils, typed Rust command wrappers
  stores/             zustand stores
src-tauri/src/
  lib.rs              builder, plugins, command registration
  error.rs            AppError
  commands/<area>.rs  thin #[tauri::command] wrappers
  tools/<area>.rs     pure logic with unit tests
```

## Adding a tool

1. Create `src/tools/<category>/<tool-id>/meta.ts` exporting `meta: ToolMeta`.
2. Create `Tool.tsx` with a default export built from `ToolPage` and `ToolSection`.
3. Put transforms in `logic.ts` as pure functions, and add a couple of tests in `logic.test.ts`.
4. Rust-backed work: logic in `src-tauri/src/tools/`, wrapper in `commands/`, register in
   `lib.rs`, typed call in `src/lib/commands.ts`.

The registry picks the tool up automatically; there is no central list to edit.

To add a shadcn primitive, run `pnpm dlx shadcn@latest add <name>`. Afterwards make sure it imports
`cn` from `@/lib/utils` (the CLI sometimes writes `from "cn"`) and doesn't pull in `next-themes`.

## Design system

The look and feel is a design system, so the whole app can be restyled without touching components.

- **Skins** (`src/styles/skins.css`): every visual part has one `ds-*` class (`ds-button`,
  `ds-field`, `ds-search`, `ds-popup`, `ds-panel`, `ds-well`, `ds-segmented`/`ds-segment`,
  `ds-switch`, `ds-slider-*`, `ds-chip`, `ds-badge`, `ds-card`, `ds-cell`, `ds-icon-tile`,
  `ds-sidebar-item`, `ds-toolbar`, `ds-menu`, `ds-tooltip`, `ds-status`, `ds-row`, ...).
  A skin reads only `--ds-*` variables.
- **Theme** (`src/styles/themes/macos.css`): sets every `--ds-*` variable plus the shadcn color
  tokens under `:root[data-style="macos"]` and `:root[data-style="macos"].dark`. It follows
  today's macOS controls, kept light, with no shadows except on floating menus and tooltips.
- **Accents** (`src/styles/accents.css`): `data-accent` sets `--ds-accent`; the theme derives
  shades with `color-mix`.
- **Registry** (`src/design/themes.ts`): styles and accents. The Appearance menu shows a style
  picker only when more than one style is registered.

To add a theme: copy `macos.css`, change the values, import it in `src/index.css`, and add an
entry to `styles` in `src/design/themes.ts`. No component changes.

Rules for components:

- Use the `ds-*` class for look, Tailwind only for layout, size and spacing.
- Don't put Tailwind color, border or shadow utilities on an element that has a `ds-*` class:
  utilities win over the components layer and override the theme.
- Missing a part? Add a skin and its variables to the theme rather than styling inline.
- Keep it light: no drop shadows or borders on panels and controls; separate with fills and spacing.

## UI rules

- Every tool page: header (icon, title, description), then panels with a title row and actions
  (copy, paste, clear) on the right.
- Selected state is a fill, never a ring.
- Monospace only for code, hashes and other values that need it.
- Light and dark mode must both look right.

## Code rules

- Function components, hooks, named exports, except `Tool.tsx` default exports (lazy loading).
- Derive values instead of syncing state with effects; memoize only heavy work.
- Rust commands return `Result<T, AppError>`; no `unwrap()` on user input.
- Tests cover logic only.

## License

By contributing, you agree that your contributions are licensed under the
[GNU Affero General Public License v3.0](LICENSE).
