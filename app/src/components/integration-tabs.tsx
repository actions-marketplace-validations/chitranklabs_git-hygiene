"use client"

import { useState } from "react"
import { CodeBlock } from "@/src/components/ui"

const INTEGRATIONS = [
	{
		id: "lefthook",
		title: "Lefthook",
		badge: "Recommended",
		filename: "lefthook.yml",
		description: "Fast parallel git hooks with native pre-commit and pre-push validation.",
		code: `# lefthook.yml
commit-msg:
  commands:
    hygiene:
      run: npx @chitrank2050/git-hygiene commit {1}

pre-push:
  commands:
    hygiene:
      run: npx @chitrank2050/git-hygiene branch`,
	},
	{
		id: "husky",
		title: "Husky",
		badge: "Classic",
		filename: ".husky/commit-msg",
		description: "Run git-hygiene from local Git hooks in npm or pnpm workspaces.",
		code: `# .husky/commit-msg
npx @chitrank2050/git-hygiene commit $1

# .husky/pre-push
npx @chitrank2050/git-hygiene branch`,
	},
	{
		id: "github-action",
		title: "GitHub Actions",
		badge: "CI / CD",
		filename: ".github/workflows/hygiene.yml",
		description: "Automated PR title inspection, branch rules, and semantic version calculation.",
		code: `name: Git Hygiene CI

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate Metadata 🌊
        uses: chitranklabs/git-hygiene@v0.4.12
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}`,
	},
]

export function IntegrationTabs() {
	const [activeId, setActiveId] = useState("lefthook")
	const active = INTEGRATIONS.find((i) => i.id === activeId) || INTEGRATIONS[0]

	return (
		<div className="mt-ml-8 rounded-2xl gh-glass p-4 sm:p-6 md:p-8">
			{/* Tab Selector - Fluid Segmented Control */}
			<div
				role="tablist"
				aria-label="Workflow integrations"
				className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-surface-2/60 border border-border/80 backdrop-blur-md max-w-full overflow-x-auto"
			>
				{INTEGRATIONS.map((tab) => (
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
								? "bg-surface text-text shadow-xs border border-border/90"
								: "text-text-muted hover:text-text hover:bg-surface/40 border border-transparent"
						}`}
					>
						<span>{tab.title}</span>
						<span
							className={`rounded-md px-1.5 py-0.5 text-3xs uppercase tracking-wider font-semibold ${
								activeId === tab.id
									? "bg-accent-soft text-accent"
									: "bg-surface-3 text-text-muted"
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
					<h3 className="font-mono text-base font-bold text-text">
						{active.title} Integration
					</h3>
					<p className="mt-2 text-sm text-text-secondary leading-relaxed font-sans">
						{active.description}
					</p>

					<div className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-3 font-mono text-xs text-text-muted border-t border-border pt-4">
						<div className="flex items-center gap-2">
							<span className="text-accent">✓</span>
							<span>Validates standard Conventional Commits</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-accent">✓</span>
							<span>Enforces type/description branch patterns</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-accent">✓</span>
							<span>Inherits <code>package.json</code> custom settings</span>
						</div>
					</div>
				</div>

				<div className="min-w-0 max-w-full overflow-hidden">
					<CodeBlock filename={active.filename} code={active.code} />
				</div>
			</div>
		</div>
	)
}
