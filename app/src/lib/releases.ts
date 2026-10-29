import {
  type GitCliffRelease,
  type GitCliffCommit,
  compactGitCliffReleases,
} from '@chitrank2050/monoline-ui/changelog';
import pkg from '../../../package.json';
import changelogData from '@/src/lib/changelog.json';

export interface ReleaseInfo {
  version: string;
  date: string;
}

const PACKAGE_NAME = '@chitrank2050/git-hygiene';
const NPM_REGISTRY_URL = `https://registry.npmjs.org/${PACKAGE_NAME}`;
const REVALIDATE_SECONDS = 3600; // Cache for 1 hour

function formatReleaseDate(timestampOrDate: number | string | Date): string {
  const date =
    typeof timestampOrDate === 'number'
      ? new Date(timestampOrDate * 1000)
      : new Date(timestampOrDate);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function getLatestRelease(): Promise<ReleaseInfo> {
  // 1. Primary: read directly from local generated changelog dataset to guarantee 100% sync
  const latestChangelog = (
    changelogData as Array<{ version?: string | null; timestamp?: number | null }>
  ).find(r => r.version && r.version !== 'Unreleased');

  if (latestChangelog?.version && latestChangelog.timestamp) {
    const rawVersion = latestChangelog.version;
    return {
      version: rawVersion.startsWith('v') ? rawVersion : `v${rawVersion}`,
      date: formatReleaseDate(latestChangelog.timestamp),
    };
  }

  // 2. Secondary fallback: check NPM registry
  const fallbackVersion = `v${pkg.version}`;
  try {
    const res = await fetch(NPM_REGISTRY_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (res.ok) {
      const data = await res.json();
      const latestVersion = data['dist-tags']?.latest;
      const publishTime = latestVersion ? data.time?.[latestVersion] : null;

      if (latestVersion && publishTime) {
        return {
          version: `v${latestVersion}`,
          date: formatReleaseDate(publishTime),
        };
      }
    }
  } catch {
    // Ignore network failures and proceed to default
  }

  return {
    version: fallbackVersion,
    date: formatReleaseDate(new Date()),
  };
}

/**
 * Consolidates fragmented patch/hotfix releases into their parent minor version
 * (e.g. v0.5.0, v0.4.0, v0.3.1, v0.2.0, v0.1.0) for clean, high-signal readability.
 */
export function groupReleasesByMinor(rawReleases: GitCliffRelease[]): GitCliffRelease[] {
  const cleaned = compactGitCliffReleases(rawReleases);
  const groups = new Map<
    string,
    {
      version: string;
      timestamp: number | null;
      commits: GitCliffCommit[];
    }
  >();

  for (const r of cleaned) {
    if (!r.version) continue;
    const match = r.version.match(/^v?(\d+\.\d+)/);
    if (!match) continue;
    const majorMinor = match[1];
    const majorMinorKey = majorMinor === '0.3' ? 'v0.3.1' : `v${majorMinor}.0`;

    if (!groups.has(majorMinorKey)) {
      groups.set(majorMinorKey, {
        version: majorMinorKey,
        timestamp: r.timestamp,
        commits: [],
      });
    }

    const group = groups.get(majorMinorKey)!;
    if (r.timestamp && (!group.timestamp || r.timestamp > group.timestamp)) {
      group.timestamp = r.timestamp;
    }

    const seenIds = new Set(group.commits.map(c => c.id));
    for (const commit of r.commits || []) {
      if (!seenIds.has(commit.id)) {
        group.commits.push({
          ...commit,
          group: commit.group
            ? commit.group
                .replace(/<!--.*?-->/g, '')
                .replace(/^[^\w]+/, '')
                .trim() || commit.group
            : 'Maintenance',
        });
        seenIds.add(commit.id);
      }
    }
  }

  return Array.from(groups.values());
}
