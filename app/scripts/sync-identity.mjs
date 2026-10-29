import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const identityFilePath = path.resolve(__dirname, '../public/identity.json');
const IDENTITY_URL = 'https://chitrankagnihotri.com/identity.json';
const TIMEOUT_MS = 4000;

async function syncIdentity() {
  console.log('🔄 Checking live identity from chitrankagnihotri.com...');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(IDENTITY_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'git-hygiene-build-sync',
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`⚠️ Remote returned HTTP ${response.status}. Retaining local identity fallback.`);
      return;
    }

    const data = await response.json();

    if (!data || typeof data !== 'object' || typeof data.name !== 'string') {
      console.warn('⚠️ Received invalid identity payload. Retaining local identity fallback.');
      return;
    }

    const formattedJson = JSON.stringify(data, null, 2) + '\n';

    let existingContent = '';
    if (fs.existsSync(identityFilePath)) {
      existingContent = fs.readFileSync(identityFilePath, 'utf8');
    }

    if (existingContent === formattedJson) {
      console.log('ℹ️ Identity is already up-to-date.');
      return;
    }

    fs.writeFileSync(identityFilePath, formattedJson, 'utf8');
    console.log('✅ Successfully synced identity.json to app/public/identity.json.');
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`⚠️ Unable to sync live identity (${error.message}). Retaining local fallback.`);
  }
}

syncIdentity();
