import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

/**
 * @param {string} filePath
 * @returns {Promise<any>}
 */
const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));

/**
 * @param {string} filePath
 * @param {unknown} data
 * @returns {Promise<void>}
 */
const writeJson = async (filePath, data) => writeFile(filePath, JSON.stringify(data, null, 2) + '\n');

async function syncVersions() {
  const cliPkgPath = path.join(rootDir, 'packages/cli/package.json');
  const cliPkg = await readJson(cliPkgPath);
  const version = cliPkg.version;

  console.log(`🔄 Synchronizing workspace versions to ${version}...`);

  // 1. Sync root package.json
  const rootPkgPath = path.join(rootDir, 'package.json');
  const rootPkg = await readJson(rootPkgPath);
  rootPkg.version = version;
  await writeJson(rootPkgPath, rootPkg);
  console.log(`   ✅ Synced root package.json -> ${version}`);

  // 2. Sync packages/cli/jsr.json
  const cliJsrPath = path.join(rootDir, 'packages/cli/jsr.json');
  const cliJsr = await readJson(cliJsrPath);
  cliJsr.version = version;
  if (cliJsr.imports?.['@chitrank2050/git-hygiene-core']) {
    cliJsr.imports['@chitrank2050/git-hygiene-core'] = `jsr:@chitrank2050/git-hygiene-core@^${version}`;
  }
  await writeJson(cliJsrPath, cliJsr);
  console.log(`   ✅ Synced packages/cli/jsr.json -> ${version}`);

  // 3. Sync packages/core/jsr.json
  const coreJsrPath = path.join(rootDir, 'packages/core/jsr.json');
  const coreJsr = await readJson(coreJsrPath);
  coreJsr.version = version;
  await writeJson(coreJsrPath, coreJsr);
  console.log(`   ✅ Synced packages/core/jsr.json -> ${version}`);

  console.log(`✨ All workspace versions synchronized successfully.`);
}

syncVersions().catch((err) => {
  console.error('❌ Version sync failed:', err);
  process.exit(1);
});
