import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function releaseSection(markdown, version) {
  const headings = [...markdown.matchAll(/^## (.+)$/gm)];
  const matches = headings.filter(heading => {
    const label = heading[1].match(/^\[?([^\]\s]+)\]?(?:\s|$)/)?.[1];
    return label === version || label === `v${version}`;
  });
  if (matches.length > 1) throw new Error(`Duplicate changelog section for ${version}`);
  if (!matches.length) return null;
  const heading = matches[0];
  const next = headings.find(entry => entry.index > heading.index);
  const body = markdown.slice(heading.index + heading[0].length, next?.index).trim();
  const meaningful = body
    .replace(/^#{1,6} .*$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
  if (!meaningful || /^(?:#{1,6}\s+|[-*]\s+)?\[?unreleased\]?[:.!]?\s*$/im.test(body)) {
    throw new Error(`Changelog section for ${version} is empty or unreleased`);
  }
  return body;
}

export function renderReleaseNotes(tag, read) {
  if (!/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(tag)) {
    throw new Error('Expected a stable vX.Y.Z tag');
  }
  const version = tag.slice(1);
  const repository = JSON.parse(read('package.json')).repository;
  const repo = (typeof repository === 'string' ? repository : repository.url)
    .replace(/^git\+/, '')
    .replace(/\.git$/, '');
  if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(repo)) {
    throw new Error('Expected a GitHub HTTPS repository URL');
  }
  const packages = ['cli', 'core'].map(directory => {
    const manifest = JSON.parse(read(`packages/${directory}/package.json`));
    if (manifest.version !== version) throw new Error(`${directory} version does not match ${tag}`);
    return {
      directory,
      manifest,
      notes: releaseSection(read(`packages/${directory}/CHANGELOG.md`), version),
    };
  });
  const packageNotes = packages.filter(entry => entry.notes);
  let changes;
  if (packageNotes.length) {
    changes = packageNotes
      .map(
        ({ directory, notes }) =>
          `### ${directory === 'cli' ? 'CLI' : 'Core'}\n\n${notes.replace(/^### /gm, '#### ')}`,
      )
      .join('\n\n');
    if (packageNotes.length !== packages.length) {
      const missing = packages
        .filter(entry => !entry.notes)
        .map(entry => (entry.directory === 'cli' ? 'CLI' : 'Core'))
        .join(' and ');
      changes += `\n\n${missing}: no package-specific summary was recorded for this version. See the repository changes below.`;
      const root = releaseSection(read('CHANGELOG.md'), version);
      if (!root) throw new Error(`Missing changelog section for ${version}`);
      changes += `\n\n### Repository changes\n\n${root.replace(/^### /gm, '#### ')}`;
    }
  } else {
    changes = releaseSection(read('CHANGELOG.md'), version);
    if (!changes) throw new Error(`Missing changelog section for ${version}`);
    changes = `Package-specific summaries were not recorded for this version. The committed repository changelog records:\n\n${changes}`;
  }
  const installs = packages
    .map(({ manifest }) => `npm install ${manifest.name}@${version}`)
    .join('\n');
  const requirements = packages
    .map(
      ({ directory, manifest }) =>
        `${directory === 'cli' ? 'CLI' : 'Core'}: Node.js ${manifest.engines.node}`,
    )
    .join('; ');
  return `# Git Hygiene ${tag}\n\n## Changes\n\n${changes}\n\n## Install\n\nChoose the CLI for command-line validation or Core for the Node.js API:\n\n\`\`\`sh\n${installs}\n\`\`\`\n\nRequirements: ${requirements}.\n\n[Documentation](https://docs.githygiene.chitrankagnihotri.com/) · [Changelog](${repo}/blob/${tag}/CHANGELOG.md)\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [tag, output] = process.argv.slice(2);
  if (!output) throw new Error('Usage: node scripts/release-notes.mjs vX.Y.Z output.md');
  const notes = renderReleaseNotes(tag, path =>
    execFileSync('git', ['show', `${tag}:${path}`], { encoding: 'utf8' }),
  );
  writeFileSync(output, notes);
}
