'use client';

import { useState } from 'react';
import { CodeBlock } from '@/src/components/ui';

const INTEGRATIONS = [
  {
    id: 'lefthook',
    title: 'Lefthook',
    badge: 'Recommended',
    filename: 'lefthook.yml',
    description: 'Fast parallel git hooks with native pre-commit and pre-push validation.',
    code: `# lefthook.yml
commit-msg:
  commands:
    hygiene:
      run: npx @chitrank2050/git-hygiene commit "{1}"

pre-push:
  commands:
    hygiene:
      run: npx @chitrank2050/git-hygiene branch`,
  },
  {
    id: 'husky',
    title: 'Husky',
    badge: 'Classic',
    filename: '.husky/commit-msg',
    description: 'Run git-hygiene from local Git hooks in npm or pnpm workspaces.',
    code: `# .husky/commit-msg
npx @chitrank2050/git-hygiene commit "$1"

# .husky/pre-push
npx @chitrank2050/git-hygiene branch`,
  },
  {
    id: 'github-action',
    title: 'GitHub Actions',
    badge: 'CI / CD',
    filename: '.github/workflows/hygiene.yml',
    description:
      'Validate pull request title format with the bundled action. Configure commit rules separately when enforcing the final squash subject.',
    code: `name: Git Hygiene CI

on:
  pull_request:
    types: [opened, edited, synchronize, reopened]
permissions:
  contents: read
jobs:
  validate:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: step-security/harden-runner@e14015d583714f6e62063499dc959a02595150a1
        with:
          egress-policy: audit
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          persist-credentials: false
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020
        with:
          node-version: '24'
      - name: Validate PR title
        uses: chitranklabs/git-hygiene@dc37236d02c55f7cf29bfed8050b7a9801db9063
        with:
          command: title
          value: \${{ github.event.pull_request.title }}`,
  },
];

export function IntegrationTabs() {
  const [activeId, setActiveId] = useState('lefthook');
  const active = INTEGRATIONS.find(i => i.id === activeId) || INTEGRATIONS[0];

  return (
    <div className="mt-ml-8 rounded-2xl gh-glass p-4 sm:p-6 md:p-8">
      {/* Tab Selector - Fluid Segmented Control */}
      <div
        role="tablist"
        aria-label="Workflow integrations"
        className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-surface-2/60 border border-border/80 backdrop-blur-md max-w-full overflow-x-auto"
      >
        {INTEGRATIONS.map(tab => (
          <button
            key={tab.id}
            id={`tab-integration-${tab.id}`}
            role="tab"
            aria-selected={activeId === tab.id}
            aria-controls={`panel-integration-${tab.id}`}
            type="button"
            onClick={() => setActiveId(tab.id)}
            className={`shrink-0 cursor-pointer inline-flex items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-xs font-semibold transition-all duration-150 ${
              activeId === tab.id
                ? 'bg-surface text-text shadow-xs border border-border/90'
                : 'text-text-muted hover:text-text hover:bg-surface/40 border border-transparent'
            }`}
          >
            <span>{tab.title}</span>
            <span
              className={`rounded-md px-1.5 py-0.5 text-3xs uppercase tracking-wider font-semibold ${
                activeId === tab.id ? 'bg-accent-soft text-accent' : 'bg-surface-3 text-text-muted'
              }`}
            >
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        id={`panel-integration-${active.id}`}
        role="tabpanel"
        aria-labelledby={`tab-integration-${active.id}`}
        className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 lg:gap-8 items-start"
      >
        <div>
          <h3 className="font-mono text-base font-bold text-text">{active.title} Integration</h3>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed font-sans">
            {active.description}
          </p>

          <div className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-3 font-mono text-xs text-text-muted border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>
                {active.id === 'github-action'
                  ? 'Validates pull request title format'
                  : 'Validates commit messages'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>
                {active.id === 'github-action'
                  ? 'Runs when pull request titles change'
                  : 'Checks branch names before pushing'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>
                Inherits <code>package.json</code> custom settings
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-0 max-w-full overflow-hidden">
          <CodeBlock filename={active.filename} code={active.code} />
        </div>
      </div>
    </div>
  );
}
