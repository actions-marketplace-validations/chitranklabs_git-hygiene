import { buildDocs } from '@chitrank2050/monoline-docs/build';
import { loadConfig } from '@chitrank2050/monoline-docs';
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(appRoot, 'public');
const assets = join(appRoot, '.docs-assets');
await mkdir(assets, { recursive: true });

// Both renderers consume the same token source; the docs shell selects its mode via color-scheme.
const tokens = await readFile(join(appRoot, 'src/styles/theme-tokens.css'), 'utf8');
const themeValues = theme => {
  const block = tokens.match(
    new RegExp(String.raw`\[data-theme=["']${theme}["']\]\s*\{([^}]+)\}`),
  )?.[1];
  if (!block) throw new Error(`Missing ${theme} theme tokens`);
  return Object.fromEntries(
    [...block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]),
  );
};
const light = themeValues('light');
const dark = themeValues('dark');
const palette = [
  '--background',
  '--foreground',
  '--muted-foreground',
  '--border',
  '--surface',
  '--accent',
];
const declarations = palette.map(key => {
  const value = light[key];
  if (!value) throw new Error(`Missing light token ${key}`);
  if (!dark[key]) throw new Error(`Missing dark token ${key}`);
  return `${key}: light-dark(${value}, ${dark[key]});`;
});

// Reuse Next's compiled, self-hosted fonts rather than requesting another font provider.
const chunks = join(appRoot, '.next/static/chunks');
const fontFaces = [];
for (const name of await readdir(chunks)) {
  if (!name.endsWith('.css')) continue;
  const css = await readFile(join(chunks, name), 'utf8');
  for (const face of css.match(/@font-face\s*\{[^}]+\}/g) ?? []) {
    if (!/font-family:\s*["']?(?:Geist|JetBrains Mono)["']?;/.test(face)) continue;
    fontFaces.push(face.replaceAll('../media/', '/_next/static/media/'));
  }
}
if (
  !fontFaces.some(face => /font-family:\s*Geist;/.test(face)) ||
  !fontFaces.some(face => /font-family:\s*["']?JetBrains Mono["']?;/.test(face))
) {
  throw new Error('Build the Next.js website before building docs: shared fonts are missing.');
}
await writeFile(
  join(assets, 'site.css'),
  `${fontFaces.join('\n')}\n:root {\n${declarations.join('\n')}\n--font-body: "Geist", system-ui, sans-serif;\n--font-code: "JetBrains Mono", monospace;\n}\n`,
);
await copyFile(join(appRoot, 'public/git-hygiene-og.png'), join(assets, 'social.png'));
await copyFile(join(appRoot, 'src/app/icon.png'), join(assets, 'icon.png'));
const config = await loadConfig({ config: resolve(appRoot, '../docs/monoline-docs.yml') });
const result = await buildDocs(config);

const token =
  process.env.VERCEL_ENV === 'production'
    ? process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN || '4acd7655f8804ea5bf6608b9c690451b'
    : undefined;
if (token && !/^[a-f0-9]{32}$/i.test(token))
  throw new Error('Cloudflare analytics token must contain 32 hexadecimal characters.');
const analytics = token
  ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token })}'></script>`
  : '';
const themeBridge = `<script>(()=>{try{const t=localStorage.getItem('gh-theme');if(t==='light'||t==='dark')localStorage.setItem('monoline-docs-theme',t)}catch{}document.addEventListener('click',e=>{if(e.target.closest?.('.theme-control')){try{localStorage.setItem('gh-theme',document.documentElement.dataset.theme)}catch{}}})})();</script>`;
for (const file of await readdir(result.outDirectory, { recursive: true })) {
  if (!file.endsWith('.html')) continue;
  const pathname = join(result.outDirectory, file);
  const html = await readFile(pathname, 'utf8');
  await writeFile(
    pathname,
    html.replace('<head>', `<head>${themeBridge}`).replace('</head>', `${analytics}</head>`),
  );
}

// The origin owns discovery. Include documentation in its sitemap and replace stale hand-written AI references.
const docsSitemap = await readFile(join(result.outDirectory, 'sitemap.xml'), 'utf8');
const entries = docsSitemap.match(/<url>[\s\S]*?<\/url>/g) ?? [];
if (!entries.length) throw new Error('Documentation sitemap contains no pages.');
// The Next.js sitemap route owns the origin sitemap.
const index = await readFile(join(result.outDirectory, 'llms.txt'), 'utf8');
await writeFile(
  join(output, 'llms.txt'),
  index.replace(
    '# git-hygiene',
    '# git-hygiene\n\n- [Website](https://githygiene.chitrankagnihotri.com/): Interactive sandbox.\n- [Changelog](https://githygiene.chitrankagnihotri.com/changelog): Release history.\n- [Source](https://github.com/chitranklabs/git-hygiene): Packages and action.',
  ),
);
await copyFile(join(result.outDirectory, 'llms-full.txt'), join(output, 'llms-full.txt'));
console.log(`Built ${result.pages} documentation pages using the website theme and fonts.`);
