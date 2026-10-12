import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');

const SITE_URL = 'https://githygiene.chitrankagnihotri.com';
const HOST = '127.0.0.1';
const PORT = Number.parseInt(process.env.SEO_TEST_PORT || '3222', 10);
const externalBaseUrl = process.env.TEST_BASE_URL;
const LOCAL_URL = externalBaseUrl ?? `http://${HOST}:${PORT}`;

const STARTUP_TIMEOUT_MS = 60_000;
const EXPECTED_PATHS = ['/', '/changelog'].toSorted();
const RESOURCE_PATHS = ['/docs/llms.txt', '/docs/llms-full.txt'];
const EXPECTED_PATH_SET = new Set([...EXPECTED_PATHS, ...RESOURCE_PATHS]);

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function getAttribute(tag, attribute) {
  const expression = new RegExp(
    `(?:^|\\s)${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    'i',
  );
  const match = tag.match(expression);
  return match ? decodeEntities(match[1] ?? match[2] ?? match[3] ?? '') : null;
}

function findElementsByAttribute(html, tagName, attribute, expectedValue) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
  return tags.filter(tag => {
    const value = getAttribute(tag, attribute);
    return value?.toLowerCase().split(/\s+/).includes(expectedValue.toLowerCase());
  });
}

function findElementByAttribute(html, tagName, attribute, expectedValue) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
  return (
    tags.find(tag => {
      const value = getAttribute(tag, attribute);
      return value?.toLowerCase().split(/\s+/).includes(expectedValue.toLowerCase());
    }) ?? null
  );
}

function countElements(html, tagName) {
  return (html.match(new RegExp(`<${tagName}(?:\\s|>)`, 'gi')) ?? []).length;
}

function extractElementText(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`, 'i'));
  return decodeEntities(match?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '');
}

function extractTags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
}

function extractJsonLd(html) {
  const scripts =
    html.match(
      /<script\b[^>]*type=(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>[\s\S]*?<\/script>/gi,
    ) ?? [];

  return scripts.map(script => {
    const json = script.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '');
    return JSON.parse(json);
  });
}

function containsSchemaType(value, expectedType) {
  if (Array.isArray(value)) {
    return value.some(item => containsSchemaType(item, expectedType));
  }
  if (!value || typeof value !== 'object') return false;
  const type = value['@type'];
  if (type === expectedType || (Array.isArray(type) && type.includes(expectedType))) {
    return true;
  }
  return Object.values(value).some(item => containsSchemaType(item, expectedType));
}

function hasSchemaType(value, expectedType) {
  const type = value?.['@type'];
  return type === expectedType || (Array.isArray(type) && type.includes(expectedType));
}

function getTopLevelSchemaNodes(jsonLd) {
  return jsonLd.flatMap(entry => entry?.['@graph'] ?? [entry]);
}

function validateHeadingOrder(html, pathname) {
  const headings = html.match(/<h[1-6]\b[^>]*>/gi) ?? [];
  let previousLevel = 0;

  for (const heading of headings) {
    const level = Number.parseInt(heading[2], 10);
    assert.ok(
      previousLevel === 0 || level <= previousLevel + 1,
      `${pathname} should not skip from h${previousLevel} to h${level}`,
    );
    previousLevel = level;
  }
}

function validateImages(html, pathname) {
  for (const image of extractTags(html, 'img')) {
    assert.notEqual(
      getAttribute(image, 'alt'),
      null,
      `${pathname} images should declare alt text, including an empty alt for decorative images`,
    );
  }
}

async function fetchResponse(pathname, redirect = 'manual', headers = {}) {
  return fetch(LOCAL_URL + pathname, {
    headers: {
      'user-agent': 'git-hygiene-seo-integration-test/1.0',
      'x-forwarded-host': new URL(SITE_URL).host,
      'x-forwarded-proto': 'https',
      ...headers,
    },
    redirect,
    signal: AbortSignal.timeout(30_000),
  });
}

async function fetchText(pathname) {
  const response = await fetchResponse(pathname);
  assert.equal(
    response.status,
    200,
    `${pathname} should return HTTP 200, received ${response.status}`,
  );
  return response.text();
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map(match =>
    decodeEntities(match[1].trim()),
  );
}

function validateStructuredData(jsonLd, pathname) {
  const nodes = getTopLevelSchemaNodes(jsonLd);
  const canonicalUrl = new URL(pathname, `${SITE_URL}/`).href;

  const page = nodes.find(
    node =>
      hasSchemaType(node, 'CollectionPage') ||
      hasSchemaType(node, 'WebPage') ||
      (pathname.startsWith('/docs/') && hasSchemaType(node, 'Article')),
  );
  assert.ok(page, `${pathname} should describe its canonical page in JSON-LD`);
  assert.equal(page.url, canonicalUrl, `${pathname} JSON-LD url should match its canonical URL`);
}

function validateInternalLinks(html, pathname) {
  for (const tag of extractTags(html, 'a')) {
    const href = getAttribute(tag, 'href')?.trim();
    assert.ok(href, `${pathname} should not contain an anchor without an href`);

    if (href.startsWith('#')) continue;

    const target = new URL(href, new URL(pathname, `${SITE_URL}/`));
    if (target.origin !== new URL(SITE_URL).origin) continue;

    assert.equal(
      target.search,
      '',
      `${pathname} internal link ${href} should not contain a query string`,
    );
    assert.ok(
      EXPECTED_PATH_SET.has(target.pathname),
      `${pathname} internal link ${href} should target a canonical sitemap path`,
    );
  }
}

function validatePage(html, pathname, expectedSchemaTypes = []) {
  const canonicalUrl = new URL(pathname, `${SITE_URL}/`).href;

  assert.equal(countElements(html, 'main'), 1, `${pathname} should have one main`);
  assert.equal(countElements(html, 'h1'), 1, `${pathname} should have one h1`);
  validateHeadingOrder(html, pathname);
  validateImages(html, pathname);

  const heading = extractElementText(html, 'h1');
  assert.ok(heading, `${pathname} should have a non-empty h1`);

  assert.equal(countElements(html, 'title'), 1, `${pathname} should contain exactly one title`);
  const title = extractElementText(html, 'title');
  assert.ok(
    pathname.startsWith('/docs/')
      ? title.length >= 10 && title.length <= 80
      : title.length >= 50 && title.length <= 60,
    `${pathname} title should be 50-60 characters, received ${title.length}: "${title}"`,
  );

  const descriptionTags = findElementsByAttribute(html, 'meta', 'name', 'description');
  assert.equal(
    descriptionTags.length,
    1,
    `${pathname} should contain exactly one meta description`,
  );
  const descriptionTag = descriptionTags[0];
  const description = getAttribute(descriptionTag ?? '', 'content')?.trim() ?? '';
  assert.ok(
    pathname.startsWith('/docs/')
      ? description.length >= 40 && description.length <= 220
      : description.length >= 150 && description.length <= 160,
    `${pathname} description should be 150-160 characters, received ${description.length}: "${description}"`,
  );

  const canonicals = findElementsByAttribute(html, 'link', 'rel', 'canonical');
  assert.equal(canonicals.length, 1, `${pathname} should contain exactly one canonical link`);
  const canonical = canonicals[0];
  assert.ok(canonical, `${pathname} should contain a canonical link`);
  assert.equal(
    new URL(getAttribute(canonical, 'href') ?? '').href,
    canonicalUrl,
    `${pathname} should use its public canonical URL`,
  );

  for (const [attribute, value] of [
    ['property', 'og:image'],
    ['name', 'twitter:image'],
  ]) {
    const images = findElementsByAttribute(html, 'meta', attribute, value);
    assert.equal(images.length, 1, `${pathname} should contain exactly one ${value}`);
    const image = images[0];
    const imageValue = getAttribute(image ?? '', 'content')?.trim() ?? '';
    assert.ok(imageValue, `${pathname} should contain ${value}`);
    assert.match(imageValue, /^https:\/\//, `${pathname} ${value} should be an absolute HTTPS URL`);
  }

  const openGraphUrls = findElementsByAttribute(html, 'meta', 'property', 'og:url');
  assert.equal(openGraphUrls.length, 1, `${pathname} should contain exactly one og:url`);
  const openGraphUrl = openGraphUrls[0];
  assert.equal(
    new URL(getAttribute(openGraphUrl ?? '', 'content') ?? '').href,
    canonicalUrl,
    `${pathname} og:url should match its canonical URL`,
  );

  const robots = findElementByAttribute(html, 'meta', 'name', 'robots');
  assert.ok(
    !getAttribute(robots ?? '', 'content')
      ?.toLowerCase()
      .includes('noindex'),
    `${pathname} should be indexable`,
  );

  const jsonLd = extractJsonLd(html);
  for (const schemaType of expectedSchemaTypes) {
    assert.ok(
      jsonLd.some(entry => containsSchemaType(entry, schemaType)),
      `${pathname} should contain ${schemaType} JSON-LD`,
    );
  }
  validateStructuredData(jsonLd, pathname);
  validateInternalLinks(html, pathname);

  return { title, description };
}

async function waitForServer(server) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  let lastError = null;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js exited before becoming ready (${server.exitCode})`);
    }

    try {
      const response = await fetchResponse('/robots.txt');
      if (response.status === 200) return;
      lastError = new Error(`Readiness endpoint returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise(resolve => setTimeout(resolve, 250));
  }

  throw new Error(`Next.js did not become ready within ${STARTUP_TIMEOUT_MS}ms: ${lastError}`);
}

async function stopServer(server) {
  if (server.exitCode !== null) return;
  const exited = new Promise(resolve => server.once('exit', resolve));
  server.kill('SIGTERM');
  const forceKill = setTimeout(() => server.kill('SIGKILL'), 5_000);
  await exited;
  clearTimeout(forceKill);
}

async function run() {
  console.log('🔍 Starting git-hygiene SEO verification suite...');
  const serverOutput = [];
  let server = null;

  if (!externalBaseUrl) {
    server = spawn(
      process.execPath,
      ['node_modules/next/dist/bin/next', 'start', '--port', String(PORT)],
      {
        cwd: appRoot,
        env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT) },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    for (const stream of [server.stdout, server.stderr]) {
      stream.setEncoding('utf8');
      stream.on('data', chunk => serverOutput.push(chunk));
    }
  }

  try {
    if (server) await waitForServer(server);
    console.log(`📡 Connected to test server at ${LOCAL_URL}`);

    const [robots, sitemapXml, llmsText] = await Promise.all([
      fetchText('/robots.txt'),
      fetchText('/sitemap.xml'),
      fetchText('/llms.txt'),
    ]);

    assert.match(robots, /git-hygiene/i, 'robots.txt should identify git-hygiene');
    assert.match(
      robots,
      /^Sitemap:\s*https:\/\/githygiene\.chitrankagnihotri\.com\/sitemap\.xml\s*$/m,
      'robots.txt should reference canonical sitemap',
    );
    console.log('✓ robots.txt validated');

    assert.match(llmsText, /^# git-hygiene$/m, 'llms.txt should identify git-hygiene');
    assert.match(llmsText, /chitranklabs\/git-hygiene/, 'llms.txt should reference github repo');
    for (const path of RESOURCE_PATHS)
      assert.ok((await fetchText(path)).length > 100, `${path} should contain documentation`);
    console.log('✓ llms.txt validated');

    const sitemapLocs = extractLocs(sitemapXml);
    const docsPaths = sitemapLocs
      .map(loc => new URL(loc).pathname)
      .filter(path => path.startsWith('/docs/'));
    assert.ok(docsPaths.length >= 10, 'The root sitemap should include the complete handbook');
    assert.equal(
      new Set(sitemapLocs).size,
      sitemapLocs.length,
      'Sitemap should not contain duplicate URLs',
    );
    for (const path of docsPaths) EXPECTED_PATH_SET.add(path);
    for (const loc of sitemapLocs) {
      const url = new URL(loc);
      assert.equal(url.protocol, 'https:', `${loc} should use HTTPS`);
      assert.equal(
        url.hostname,
        'githygiene.chitrankagnihotri.com',
        `${loc} should use canonical hostname`,
      );
      assert.ok(EXPECTED_PATH_SET.has(url.pathname), `${loc} should match a canonical route`);
    }
    assert.equal(
      (await fetchResponse('/missing-page')).status,
      404,
      'Missing URLs should return HTTP 404',
    );
    const docExport = await fetchText('/docs/getting-started/index.md');
    assert.match(
      docExport,
      /npm install --save-dev @chitrank2050\/git-hygiene/,
      'Copy Page export should preserve install commands',
    );
    assert.match(
      await fetchText('/llms-full.txt'),
      /getRecommendedBump/,
      'AI exports should contain the real Core API',
    );
    assert.doesNotMatch(
      await fetchText('/llms-full.txt'),
      /import[\s\S]{0,100}analyzeReleaseBump/,
      'AI exports should not teach a nonexistent API',
    );
    console.log('✓ sitemap.xml, Markdown exports and missing-page behavior validated');

    const pages = [];
    for (const pathname of [...EXPECTED_PATHS, ...docsPaths]) {
      const html = await fetchText(pathname);
      const expectedSchemaTypes =
        pathname === '/'
          ? ['WebSite', 'SoftwareSourceCode', 'WebPage']
          : pathname.startsWith('/docs/')
            ? pathname === '/docs/'
              ? ['WebPage', 'WebSite']
              : ['Article', 'BreadcrumbList']
            : ['CollectionPage', 'BreadcrumbList'];
      const metadata = validatePage(html, pathname, expectedSchemaTypes);
      pages.push(metadata);
      console.log(
        `✓ ${pathname} (Title: ${metadata.title.length}c, Desc: ${metadata.description.length}c)`,
      );
    }

    assert.equal(
      new Set(pages.map(p => p.title)).size,
      pages.length,
      'All pages should have unique titles',
    );
    assert.equal(
      new Set(pages.map(p => p.description)).size,
      pages.length,
      'All pages should have unique descriptions',
    );

    console.log('\n🎉 ALL SEO & TECHNICAL STANDARDS VERIFIED SUCCESSFULLY!');
  } catch (error) {
    if (serverOutput.length > 0) {
      console.error('\n--- Server Output ---');
      console.error(serverOutput.join(''));
    }
    throw error;
  } finally {
    if (server) await stopServer(server);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
