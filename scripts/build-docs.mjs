// Assembles docs/ into a self-contained _site/ for GitHub Pages.
//
// docs/index.html links ../src/styles/liquid.css so it works when you open it
// straight off disk. That path escapes the published directory, so the one job
// here is to bring the stylesheet along and rewrite the link to match.

import { mkdir, readFile, rm, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '_site');

const SOURCE_HREF = '../src/styles/liquid.css';
const PUBLISHED_HREF = './liquid.css';
const SITE = 'https://pierrejochem.github.io/glass-ui-react/';
const REPO = 'https://github.com/pierrejochem/glass-ui-react';

const fail = (message) => {
  console.error(`build-docs: ${message}`);
  process.exit(1);
};

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

// 1. the page
const html = await readFile(join(root, 'docs/index.html'), 'utf8');
if (!html.includes(SOURCE_HREF)) {
  fail(`docs/index.html no longer links ${SOURCE_HREF} — update SOURCE_HREF in this script`);
}

const { version } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const stamped = html
  .replaceAll(SOURCE_HREF, PUBLISHED_HREF)
  .replace(/(<p class="d-ver">)v[0-9][^ <]*/, `$1v${version}`);

if (stamped.includes(SOURCE_HREF)) fail('stylesheet link was not rewritten');
if (!stamped.includes(`v${version}`)) fail('version stamp did not apply');

// The canonical URL, sitemap and robots.txt all have to name the same address
// or crawlers get contradictory answers about where this page lives
if (!stamped.includes(`<link rel="canonical" href="${SITE}"`)) {
  fail(`docs/index.html canonical link does not match ${SITE}`);
}

await writeFile(join(out, 'index.html'), stamped);

// 2. the stylesheet the previews are made of
await cp(join(root, 'src/styles/liquid.css'), join(out, 'liquid.css'));

// 2b. the social card. og:image has to resolve to an absolute URL that actually
// serves an image — a 404 here is worse than having no card at all
await cp(join(root, 'docs/og.png'), join(out, 'og.png'));

// 3. Pages runs Jekyll by default, which would swallow anything underscored
await writeFile(join(out, '.nojekyll'), '');

// 4. what crawlers ask for before they ask for the page
const today = new Date().toISOString().slice(0, 10);

await writeFile(
  join(out, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`
);

await writeFile(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
);

// llms.txt — the answer engines' equivalent of robots.txt: a plain-text
// summary they can read without parsing 150kB of documentation HTML
await writeFile(
  join(out, 'llms.txt'),
  `# glass-ui-react

> A React component library built on one material: translucent glass that lights
> up when it's on. 30 accessible components sharing a single visual rule —
> things you press are raised, things you pour text into are recessed.

- Version: ${version}
- Install: npm install glass-ui-react
- Docs: ${SITE}
- Repository: ${REPO}
- License: MIT
- Requires: React >= 18

## Docs

- [Documentation](${SITE}): every component, prop and type, with live previews
- [README](${REPO}#readme): install, quick start, theming
`
);

console.log(`build-docs: _site ready (v${version})`);
