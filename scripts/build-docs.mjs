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

await writeFile(join(out, 'index.html'), stamped);

// 2. the stylesheet the previews are made of
await cp(join(root, 'src/styles/liquid.css'), join(out, 'liquid.css'));

// 3. Pages runs Jekyll by default, which would swallow anything underscored
await writeFile(join(out, '.nojekyll'), '');

console.log(`build-docs: _site ready (v${version})`);
