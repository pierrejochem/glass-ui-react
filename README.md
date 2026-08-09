# glass-ui-react

A React component library built on one material: translucent glass that lights up when it's on.

Every surface is see-through and blurs what's behind it. Things you press are raised;
things you pour text into are recessed. That one rule is what makes 30 components read
as a single object rather than a pile of unrelated shapes.

**[Read the docs →](https://pierrejochem.github.io/glass-ui-react/)** — every component, prop and
type, with live previews.

```bash
npm install glass-ui-react
```

```tsx
import { ThemeProvider, ToastProvider, ModeRack, ModeToggle } from 'glass-ui-react';
import 'glass-ui-react/styles.css';

export function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <ToastProvider>
        <ModeRack>
          <ModeToggle name="Sleep" accent="sleep" onLabel="Dims at 10:30" />
          <ModeToggle name="Do not disturb" accent="dnd" onLabel="Calls silenced" />
          <ModeToggle name="Personal" accent="personal" onLabel="Work apps hidden" />
        </ModeRack>
      </ToastProvider>
    </ThemeProvider>
  );
}
```

## What's in it

| Group | Components |
| --- | --- |
| Actions | `Button` `IconButton` `Toggle` `ToggleGroup` |
| Selection | `Switch` `Checkbox` `RadioGroup` `Segmented` `Select` `Slider` |
| Text | `Input` `Textarea` |
| Disclosure | `Tabs` `Accordion` `Collapsible` |
| Overlays | `Popover` `DropdownMenu` `Tooltip` `HoverCard` `Dialog` `AlertDialog` `ToastProvider` / `useToast` |
| Display | `Card` `Badge` `Avatar` `AvatarStack` `AspectRatio` `Separator` `ScrollArea` `Progress` |
| Data | `DataTable` `DatePicker` |
| Signature | `ModeToggle` `ModeRack` |
| Theme | `ThemeProvider` / `useTheme` `AmbientLight` |

## Controlled or not

Every stateful component works both ways. Leave the value off and it keeps its own;
pass one and you own it.

```tsx
<Switch label="Dim the screen" defaultChecked />                    // uncontrolled
<Switch label="Dim the screen" checked={on} onCheckedChange={setOn} /> // controlled
```

## Theming

The stylesheet is driven entirely by custom properties. Override them anywhere:

```css
:root {
  --sleep: #3E7BFA;      /* the three accents */
  --dnd: #FF3428;
  --personal: #FFA51F;
  --blur: 22px;          /* how frosted the glass is */
  --panel: rgba(255, 255, 255, .88);
}
```

Dark mode is `data-theme="dark"` on any ancestor — `ThemeProvider` sets it on `<html>`.

Per-component, pass `accent="sleep" | "dnd" | "personal"`, or set `--accent` yourself.

### A note on glass

`backdrop-filter` makes an element a *backdrop root*: anything nested inside it can no
longer blur its own siblings. That's why `Card` is translucent but not blurred — so the
menus and popovers inside it can frost what they cover. If you add blur to your own
containers, expect popovers inside them to stop frosting.

## Accessibility

Native elements wherever one exists: `Switch` and `Checkbox` are real inputs, `Dialog`
wraps `<dialog>` so focus trapping and Escape are the platform's job. Beyond that:
roving tab index on `Tabs`, arrow-key navigation in `Select`, `DropdownMenu` and
`DatePicker`, `aria-sort` on exactly one column of `DataTable`, and a tri-state header
checkbox that goes indeterminate when a page is partly selected.

`prefers-reduced-motion` is respected throughout.

## Development

```bash
npm install
npm test          # vitest + testing-library, 80 tests
npm run coverage  # thresholds: 80% lines
npm run typecheck
npm run lint
npm run build     # tsup -> esm + cjs + d.ts
npm run docs:build # docs/ -> _site/ for GitHub Pages
```

## Documentation

`docs/index.html` is the whole site: one file, no build step, no framework. Open it straight
from disk and it works — it links `src/styles/liquid.css` relatively, so every preview on the
page is the real material rather than a screenshot, and it can never drift from the stylesheet
beside it.

`npm run docs:build` assembles `_site/` for publishing: it copies the page, brings the
stylesheet along as `liquid.css`, rewrites the link to match, stamps the version from
`package.json`, and drops a `.nojekyll` so Pages doesn't run the page through Jekyll.

The `Docs` workflow deploys that to GitHub Pages on every push to `main` that touches the page,
the stylesheet, or the build script. It needs one setting, once: **Settings → Pages → Source →
GitHub Actions**. Nothing else — no secrets, no `gh-pages` branch, no `npm ci` (the build script
uses nothing outside `node:*`).

Deployment does not wait for the test matrix, so CI builds the site on every pull request
instead and asserts nothing in the published page points outside itself. A broken docs build
fails the PR rather than the deploy.

## Releasing

CI runs lint, typecheck, tests and build on Node 18/20/22, then packs the tarball and
asserts every advertised entry point is actually inside it.

To publish, bump the version, tag it, and push the tag:

```bash
npm version minor
git push --follow-tags
```

The release workflow re-runs the full gate against that exact commit, checks the tag
matches `package.json`, and publishes with npm provenance. It needs one secret,
`NPM_TOKEN` (an automation token), and a `npm-publish` environment if you want a manual
approval step.

`workflow_dispatch` gives you a dry run that packs and validates without publishing.

## License

MIT
