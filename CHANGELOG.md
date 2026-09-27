# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-09-27

### Fixed

- CommonJS consumers under TypeScript's `node16` or `nodenext` resolution no
  longer receive ESM type declarations. The `exports` map carried a single
  top-level `"types"` pointing at `dist/index.d.ts`, which is ESM-flavoured
  because the package sets `"type": "module"`, so a `require` of the package
  resolved to declarations that did not describe what it actually got.
  `dist/index.d.cts` was already built and published but nothing referenced
  it; `"types"` now sits inside the `import` and `require` conditions so each
  points at its matching declaration file.

## [0.1.0] - 2026-09-27

First public release.

### Added

- Components sharing one glass material: pressable surfaces are raised, text
  inputs are recessed, and every surface blurs what sits behind it.
  - **Actions** — `Button`, `IconButton`, `Toggle`, `ToggleGroup`
  - **Selection** — `Switch`, `Checkbox`, `RadioGroup`, `Segmented`, `Select`, `Slider`
  - **Text** — `Input`, `Textarea`
  - **Disclosure** — `Tabs`, `Accordion`, `Collapsible`
  - **Overlays** — `Popover`, `DropdownMenu`, `Tooltip`, `HoverCard`, `Dialog`,
    `AlertDialog`, `ToastProvider` / `useToast`
  - **Display** — `Card`, `Badge`, `Avatar`, `AvatarStack`, `AspectRatio`,
    `Separator`, `ScrollArea`, `Progress`
  - **Data** — `DataTable`, `DatePicker`
  - **Signature** — `ModeToggle`, `ModeRack`
  - **Theme** — `ThemeProvider` / `useTheme`, `AmbientLight`
- Controlled and uncontrolled modes for every stateful component.
- Stylesheet published separately as `glass-ui-react/styles.css`.
- ESM and CommonJS builds with bundled TypeScript declarations.

[Unreleased]: https://github.com/pierrejochem/glass-ui-react/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/pierrejochem/glass-ui-react/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/pierrejochem/glass-ui-react/releases/tag/v0.1.0
