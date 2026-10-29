import type { Metadata } from 'next';

import { Button } from '@chitrank2050/monoline-ui/button';
import { Card } from '@chitrank2050/monoline-ui/card';
import { Container } from '@chitrank2050/monoline-ui/container';
import { SectionHead } from '@chitrank2050/monoline-ui/section-head';

import { InstallCommand } from '@/src/components/install-command';
import { IntegrationTabs } from '@/src/components/integration-tabs';
import JsonLd, {
  createWebPageJsonLd,
  getPersonJsonLd,
  getSoftwareSourceCodeJsonLd,
  getWebsiteJsonLd,
} from '@/src/components/json-ld';
import { LiveSandbox } from '@/src/components/live-sandbox';
import { CodeBlock } from '@/src/components/ui';
import { fetchIdentity } from '@/src/lib/identity';
import { createPageMetadata } from '@/src/lib/metadata';
import { getLatestRelease } from '@/src/lib/releases';
import { siteUrl } from '@/src/lib/seo';

import pkg from '../../../package.json';

const homeTitle = 'git-hygiene - Commits, Branches and PR Title Validation';
const homeDescription =
  'Validate conventional commits, branch names and pull request titles with shared configuration. Use git-hygiene in Git hooks, GitHub Actions or Node.js tooling.';

export const metadata: Metadata = createPageMetadata({
  title: homeTitle,
  description: homeDescription,
  path: '/',
  absoluteTitle: true,
});

const integrations = [
  {
    metric: 'Local Git hooks',
    hygiene: 'CLI package',
    setup: 'Install with npm or pnpm',
    note: 'Validate commit messages and branch names through Lefthook or Husky.',
  },
  {
    metric: 'Pull request checks',
    hygiene: 'Bundled GitHub Action',
    setup: 'No npm install step',
    note: 'Check PR titles and branches using your repository configuration.',
  },
  {
    metric: 'Custom tooling',
    hygiene: 'Core API',
    setup: 'Install Core package',
    note: 'Embed asynchronous validation and configuration resolution in Node.js tools.',
  },
];

const distributionPackages = [
  {
    name: 'NPM Registry',
    package: '@chitrank2050/git-hygiene',
    href: 'https://www.npmjs.com/package/@chitrank2050/git-hygiene',
    description: 'Standard CLI runner for local git hooks (Lefthook, Husky) and pre-push checks.',
    badge: 'CLI',
  },
  {
    name: 'JSR Registry',
    package: '@chitrank2050/git-hygiene',
    href: 'https://jsr.io/@chitrank2050/git-hygiene',
    description: 'TypeScript package distributed through JSR for supported runtimes.',
    badge: 'TypeScript',
  },
  {
    name: 'GitHub Action',
    package: 'chitranklabs/git-hygiene',
    href: 'https://github.com/marketplace/actions/git-hygiene-validator',
    description: 'Automated PR title & branch validator with semantic release bump outputs.',
    badge: 'CI / CD',
  },
  {
    name: 'Core Engine',
    package: '@chitrank2050/git-hygiene-core',
    href: 'https://www.npmjs.com/package/@chitrank2050/git-hygiene-core',
    description:
      'Programmatic TypeScript API for custom CI pipelines and internal developer tooling.',
    badge: 'Library',
  },
];

const keyPillars = [
  {
    number: '01',
    title: 'Unified Metadata Engine',
    description:
      'Define your naming rules once in package.json. Simultaneously validate local git commit messages, pre-push branch names, and remote GitHub pull requests.',
  },
  {
    number: '02',
    title: 'Node.js CLI and Core API',
    description:
      'Run the published CLI on Node.js 24+, or import the asynchronous Core API into your own developer tooling.',
  },
  {
    number: '03',
    title: 'Smart Semantic Bumping',
    description:
      'Inspects commit patterns to automatically recommend semantic version increments (major, minor, patch) with machine-readable JSON outputs for release bots.',
  },
  {
    number: '04',
    title: 'Commitlint Compatibility',
    description:
      'Imports selected conventional-preset settings. Configure additional commitlint rules explicitly and verify your policy before changing hooks.',
  },
];

export default async function HomePage() {
  const [release, identity] = await Promise.all([getLatestRelease(), fetchIdentity()]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      identity ? getPersonJsonLd(identity) : null,
      getWebsiteJsonLd(identity, siteUrl),
      getSoftwareSourceCodeJsonLd(identity, siteUrl, pkg.version),
      createWebPageJsonLd({
        title: homeTitle,
        description: homeDescription,
        path: '/',
      }),
    ].filter(Boolean),
  };

  return (
    <div className="relative min-h-screen gh-canvas">
      <JsonLd data={jsonLd} />

      <Container as="main" id="main-content" tabIndex={-1} className="pt-ml-10 pb-ml-24">
        {/* ── HERO SECTION ── */}
        <section className="text-center max-w-4xl mx-auto pt-4 sm:pt-ml-6 pb-ml-12 px-2 sm:px-0">
          {/* Status Eyebrow Badge */}
          <div className="gh-glass inline-flex items-center justify-center gap-2 rounded-full px-3.5 py-1.5 shadow-xs mb-ml-6 cursor-default whitespace-nowrap max-w-full overflow-hidden">
            <span className="inline-flex items-center gap-1.5 font-mono text-2xs font-semibold text-accent shrink-0">
              <span className="gh-status-dot" aria-hidden="true" />
              {release.version}
            </span>
            <span className="text-border-strong font-mono text-xs select-none shrink-0">/</span>
            <span className="font-mono text-3xs sm:text-2xs font-medium text-text-muted uppercase tracking-[0.06em] truncate">
              Node.js 24+ · CLI, Core and Action
            </span>
          </div>

          {/* High-Conviction Product Headline (Roman, tight optical tracking, no AI accent highlight) */}
          <h1 className="display-title font-sans text-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.035em] leading-[1.06]">
            Validate commits, branches and pull request titles.
          </h1>

          {/* Problem & Value Prop Subtitle */}
          <p className="subheading mt-4 sm:mt-ml-5 text-text-secondary text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto font-sans tracking-[-0.012em]">
            Use one repository configuration for Conventional Commits, branch naming policies and
            pull request titles. Run checks in local Git hooks, GitHub Actions or your own Node.js
            tools.
          </p>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-ml-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="md" className="w-full sm:w-auto shadow-md hover:shadow-lg">
              <a href="#sandbox">Try Live Sandbox</a>
            </Button>
            <Button asChild variant="secondary" size="md" className="w-full sm:w-auto">
              <a
                href="https://github.com/chitranklabs/git-hygiene"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub ↗
              </a>
            </Button>
          </div>

          {/* Interactive One-Click Install Pill */}
          <div className="mt-4 sm:mt-ml-5 flex justify-center max-w-full overflow-x-auto">
            <InstallCommand command="pnpm add -D @chitrank2050/git-hygiene" />
          </div>

          {/* Integrated Hardware Telemetry Spec Strip */}
          <div className="mt-8 sm:mt-ml-12 gh-spec-strip">
            <div className="gh-spec-item">
              <strong className="block text-xl sm:text-2xl font-bold text-text font-mono tabular-nums tracking-tight">
                CLI
              </strong>
              <span className="text-3xs uppercase tracking-[0.06em] text-accent font-semibold font-mono">
                Local Git Hooks
              </span>
              <p className="text-3xs text-text-muted leading-tight font-sans mt-0.5">
                Install the CLI with its runtime dependencies for commit and branch checks.
              </p>
            </div>
            <div className="gh-spec-item">
              <strong className="block text-xl sm:text-2xl font-bold text-text font-mono tabular-nums tracking-tight">
                Core API
              </strong>
              <span className="text-3xs uppercase tracking-[0.06em] text-accent font-semibold font-mono">
                Custom Tooling
              </span>
              <p className="text-3xs text-text-muted leading-tight font-sans mt-0.5">
                Import asynchronous validation into your Node.js tools.
              </p>
            </div>
            <div className="gh-spec-item">
              <strong className="block text-xl sm:text-2xl font-bold text-text font-mono tabular-nums tracking-tight">
                Action
              </strong>
              <span className="text-3xs uppercase tracking-[0.06em] text-accent font-semibold font-mono">
                Pull Requests
              </span>
              <p className="text-3xs text-text-muted leading-tight font-sans mt-0.5">
                Use the bundled GitHub Action without an npm install step.
              </p>
            </div>
            <div className="gh-spec-item">
              <strong className="block text-xl sm:text-2xl font-bold text-text font-mono tabular-nums tracking-tight">
                Node 24+
              </strong>
              <span className="text-3xs uppercase tracking-[0.06em] text-accent font-semibold font-mono">
                Native Types
              </span>
              <p className="text-3xs text-text-muted leading-tight font-sans mt-0.5">
                Executes pure TypeScript directly via built-in experimental-strip-types.
              </p>
            </div>
          </div>
        </section>

        {/* ── LIVE INTERACTIVE SANDBOX (Front & Center Workbench) ── */}
        <section id="sandbox" className="mt-ml-8 scroll-mt-24">
          <SectionHead
            eyebrow="Interactive Workbench"
            title="Test your Git metadata rules live in the browser."
            lede="Validate commit messages and branch names with the same server-side core engine used by the CLI."
            size="sm"
            level={2}
          />
          <div className="mt-ml-6">
            <LiveSandbox />
          </div>
        </section>

        {/* ── ARCHITECTURE & TELEMETRY COMPARISON MATRIX ── */}
        <section id="benchmark" className="mt-ml-24 pt-ml-8 border-t border-border scroll-mt-24">
          <SectionHead
            eyebrow="Workflow Integrations"
            title="Choose where to enforce your Git metadata rules."
            lede="The CLI and Core packages have runtime dependencies. The bundled GitHub Action runs without a separate npm install."
            size="sm"
            level={2}
          />

          <div className="mt-ml-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-xs backdrop-blur-xl">
            <div
              role="region"
              aria-label="Workflow integration comparison"
              tabIndex={0}
              className="overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-accent"
            >
              <table className="w-full min-w-[620px] text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-2/60 text-text-muted text-3xs uppercase tracking-[0.08em]">
                    <th className="py-3 px-4 sm:px-6 font-semibold whitespace-nowrap">Workflow</th>
                    <th className="py-3 px-4 sm:px-6 font-bold text-accent whitespace-nowrap">
                      Integration
                    </th>
                    <th className="py-3 px-4 sm:px-6 font-semibold text-text-muted whitespace-nowrap">
                      Setup
                    </th>
                    <th className="py-3 px-4 sm:px-6 font-semibold hidden md:table-cell">
                      What it checks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {integrations.map(b => (
                    <tr key={b.metric} className="hover:bg-surface-2/40 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-text whitespace-nowrap">
                        {b.metric}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-accent whitespace-nowrap">
                        <span className="gh-badge">
                          <span className="gh-status-dot" aria-hidden="true" />
                          <span>{b.hygiene}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-text-muted whitespace-nowrap">
                        {b.setup}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-sans text-xs text-text-secondary hidden md:table-cell leading-relaxed">
                        {b.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── CORE CAPABILITIES (2x2 Asymmetric Grid) ── */}
        <section id="features" className="mt-ml-24 pt-ml-8 border-t border-border scroll-mt-24">
          <SectionHead
            eyebrow="Core Architecture"
            title="Everything you need for strict, automated Git hygiene."
            size="sm"
            level={2}
          />

          <div className="mt-ml-8 grid grid-cols-1 md:grid-cols-2 gap-ml-4">
            {keyPillars.map(pillar => (
              <Card key={pillar.number} size="md">
                <Card.Body>
                  <div className="flex items-center gap-2 mb-ml-2">
                    <span className="font-mono text-xs font-bold text-accent">{pillar.number}</span>
                    <span className="text-border-strong font-mono text-xs">/</span>
                    <Card.Title className="text-sm font-bold text-text font-mono">
                      {pillar.title}
                    </Card.Title>
                  </div>
                  <Card.Description className="text-xs text-text-secondary leading-relaxed font-sans">
                    {pillar.description}
                  </Card.Description>
                </Card.Body>
              </Card>
            ))}
          </div>
        </section>

        {/* ── DEVELOPER WORKFLOWS (Interactive Hook Drop-ins) ── */}
        <section id="integrations" className="mt-ml-24 pt-ml-8 border-t border-border scroll-mt-24">
          <SectionHead
            eyebrow="Developer Workflows"
            title="Integrates in seconds into your existing hooks & CI."
            lede="Switch between Lefthook, Husky, or GitHub Actions to see the exact drop-in configuration."
            size="sm"
            level={2}
          />
          <IntegrationTabs />
        </section>

        {/* ── DUAL ARCHITECTURE: DECLARATIVE CONFIG & PROGRAMMATIC CORE ── */}
        <section
          id="configuration"
          className="mt-ml-24 pt-ml-8 border-t border-border scroll-mt-24"
        >
          <SectionHead
            eyebrow="Integration & APIs"
            title="Declarative CLI config or headless programmatic library."
            lede="Define rules in package.json for zero-config CLI enforcement, or import the standalone core engine directly into your custom CI tools."
            size="sm"
            level={2}
          />

          <div className="mt-ml-8 grid grid-cols-1 lg:grid-cols-2 gap-ml-6 items-start">
            {/* Declarative CLI Station */}
            <div className="space-y-ml-4">
              <div className="flex items-center justify-between pb-ml-2 border-b border-border">
                <span className="font-mono text-xs font-bold text-text">
                  Declarative Git Hook Config
                </span>
                <span className="font-mono text-3xs font-semibold text-accent bg-accent-soft px-2 py-0.5 rounded border border-accent/20">
                  package.json
                </span>
              </div>
              <div className="min-w-0 max-w-full overflow-hidden">
                <CodeBlock
                  filename="package.json"
                  code={`{
  "git-hygiene": {
    "extends": ["@commitlint/config-conventional"],
    "types": [
      "feat", "fix", "chore", "docs",
      "style", "refactor", "perf", "test",
      "build", "ci", "revert"
    ],
    "ignoreBranches": ["main", "master", "develop"],
    "maxHeaderLength": 100,
    "allowEmptyScope": false,
    "rules": {
      "header-max-length": [2, "always", 100]
    }
  }
}`}
                />
              </div>
              <p className="text-xs text-text-muted font-sans leading-relaxed">
                The conventional preset contributes selected settings, not every commitlint rule.
                Configure additional commit rules explicitly.
              </p>
            </div>

            {/* Programmatic Engine Station */}
            <div id="core-api" className="space-y-ml-4 scroll-mt-24">
              <div className="flex items-center justify-between pb-ml-2 border-b border-border">
                <span className="font-mono text-xs font-bold text-text">
                  Programmatic Core Engine
                </span>
                <span className="font-mono text-3xs font-semibold text-text-muted bg-surface-2 px-2 py-0.5 rounded border border-border">
                  TypeScript ESM
                </span>
              </div>
              <div className="min-w-0 max-w-full overflow-hidden">
                <CodeBlock
                  filename="validate.ts"
                  code={`import {
  validateCommit,
  validateBranch,
  getRecommendedBump
} from '@chitrank2050/git-hygiene-core';

// 1. Validate Commit Message
const commit = await validateCommit('feat(api): add webhook support');
console.log(commit.valid); // true

// 2. Validate Git Branch
const branch = await validateBranch('feat/webhook-retry-policy');
console.log(branch.valid); // true

// 3. Recommended Release Increment
const bump = await getRecommendedBump();
console.log(bump.releaseType); // Derived from repository history`}
                />
              </div>
              <div className="rounded-xl border border-border bg-surface p-ml-3 flex items-center justify-between gap-3">
                <span className="font-mono text-3xs font-semibold text-text-muted uppercase tracking-wider">
                  Install Core:
                </span>
                <InstallCommand
                  command="pnpm add @chitrank2050/git-hygiene-core"
                  className="flex-1 bg-surface-2 py-1 text-2xs"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── MULTI-REGISTRY DISTRIBUTION SHELF ── */}
        <section id="registries" className="mt-ml-24 pt-ml-8 border-t border-border scroll-mt-24">
          <SectionHead
            eyebrow="Release Shelf"
            title="Multi-registry distribution across Node, Deno, and GitHub Actions."
            size="sm"
            level={2}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-ml-4 mt-ml-8">
            {distributionPackages.map(pkgItem => (
              <Card
                key={pkgItem.name}
                size="sm"
                href={pkgItem.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card.Body>
                  <div className="flex items-center justify-between mb-ml-2">
                    <span className="font-mono text-3xs font-bold text-accent uppercase tracking-wider whitespace-nowrap shrink-0 bg-accent-soft px-2 py-0.5 rounded border border-accent/20">
                      {pkgItem.badge}
                    </span>
                    <Card.Arrow />
                  </div>
                  <Card.Title className="font-mono text-xs font-bold text-text truncate">
                    {pkgItem.package}
                  </Card.Title>
                  <Card.Description className="mt-1.5 text-xs text-text-muted leading-normal font-sans">
                    {pkgItem.description}
                  </Card.Description>
                </Card.Body>
              </Card>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
