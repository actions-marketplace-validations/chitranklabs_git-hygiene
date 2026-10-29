import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const changelogJsonPath = path.join(rootDir, 'app/src/lib/changelog.json');
const cliffConfigPath = path.join(rootDir, 'cliff.toml');

function isGitCliffAvailable() {
  try {
    execSync('git-cliff --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function generateChangelog() {
  if (isGitCliffAvailable() && existsSync(cliffConfigPath)) {
    console.log('📖 Generating web changelog with git-cliff...');
    try {
      const raw = execSync(`git-cliff --config "${cliffConfigPath}" --context`, {
        cwd: rootDir,
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024,
      });
      const parsed = JSON.parse(raw);
      const formatted = JSON.stringify(parsed, null, 2) + '\n';

      const current = existsSync(changelogJsonPath) ? readFileSync(changelogJsonPath, 'utf8') : '';
      if (current === formatted) {
        console.log('ℹ️ Web changelog is already up-to-date.');
      } else {
        writeFileSync(changelogJsonPath, formatted, 'utf8');
        console.log('✅ Web changelog generated successfully.');
      }
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('⚠️ git-cliff generation encountered an issue:', message);
    }
  }

  if (!existsSync(changelogJsonPath)) {
    console.log('ℹ️ git-cliff not available, generating fallback empty changelog dataset.');
    writeFileSync(changelogJsonPath, '[]\n', 'utf8');
  } else {
    console.log('ℹ️ Preserving existing web changelog dataset.');
  }
}

generateChangelog();
