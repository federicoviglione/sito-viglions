// scripts/fetch-fonts.mjs
import { writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = join(__dirname, '..', 'public', 'fonts');

// Fraunces upstream (undercasetype/Fraunces) only ships TTF variable fonts;
// fontsource provides a stable full-axis woff2 build (wght, opsz, SOFT, WONK
// preserved). Inter ships a woff2 directly from rsms/inter.
const FONTS = [
  {
    name: 'Fraunces-VariableFont.woff2',
    url: 'https://cdn.jsdelivr.net/npm/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2',
  },
  {
    name: 'InterVariable.woff2',
    url: 'https://github.com/rsms/inter/raw/master/docs/font-files/InterVariable.woff2',
  },
];

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function download(url, dest) {
  console.log(`  → fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log(`  ✓ saved ${dest} (${(buf.length / 1024).toFixed(1)} KB)`);
}

await mkdir(FONTS_DIR, { recursive: true });

for (const f of FONTS) {
  const dest = join(FONTS_DIR, f.name);
  if (await exists(dest)) {
    console.log(`✓ ${f.name} already present, skipping`);
    continue;
  }
  await download(f.url, dest);
}

console.log('Done.');
