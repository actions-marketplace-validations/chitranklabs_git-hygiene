import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@chitrank2050/monoline-ui/button"
import { Container } from "@chitrank2050/monoline-ui/container"
import { SectionHead } from "@chitrank2050/monoline-ui/section-head"
import { ChangelogTimeline } from "@chitrank2050/monoline-ui/changelog"
import type { GitCliffRelease } from "@chitrank2050/monoline-ui/changelog"

import JsonLd, {
	createBreadcrumbJsonLd,
	createCollectionPageJsonLd,
	getPersonJsonLd,
} from "@/src/components/json-ld"
import changelogJson from "@/src/lib/changelog.json"
import { fetchIdentity } from "@/src/lib/identity"
import { createPageMetadata } from "@/src/lib/metadata"
import { groupReleasesByMinor } from "@/src/lib/releases"

const changelogTitle = "Release Changelog and Version History | git-hygiene"
const changelogDescription =
	"Read git-hygiene release notes for CLI and Core updates, conventional commit validation, branch naming rules and GitHub Action integrations."

export const metadata: Metadata = createPageMetadata({
	title: changelogTitle,
	description: changelogDescription,
	path: "/changelog",
	absoluteTitle: true,
})

// Group fragmented patch releases into clean major/minor series while retaining all patch commits
const releases = groupReleasesByMinor(changelogJson as unknown as GitCliffRelease[])

export default async function ChangelogPage() {
	const identity = await fetchIdentity()

	return (
		<div className="gh-canvas relative min-h-screen overflow-x-hidden">
			<JsonLd
				data={{
					"@context": "https://schema.org",
					"@graph": [
						identity ? getPersonJsonLd(identity) : null,
						createCollectionPageJsonLd({
							title: changelogTitle,
							description: changelogDescription,
							path: "/changelog",
							items: releases.map(release => ({
								name: `git-hygiene ${release.version ?? "Unreleased"}`,
								path: `/changelog#release-${(release.version ?? "unreleased").replace(
									/\./g,
									"-",
								)}` as const,
							})),
						}),
						createBreadcrumbJsonLd([
							{ name: "Home", path: "/" },
							{ name: "Changelog", path: "/changelog" },
						]),
					].filter(Boolean),
				}}
			/>

			<Container as="main" id="main-content" tabIndex={-1} className="max-w-4xl pt-ml-10 pb-ml-24">
				{/* Header Section */}
				<div className="mb-ml-12 border-b border-border pb-ml-8">
					<SectionHead
						eyebrow="Release Notes"
						title="Changelog"
						lede="Every feature, performance optimization, and bug fix shipped across official releases, generated from conventional commits."
						size="md"
						level={1}
					/>
				</div>

				{/* Monoline UI Changelog Component */}
				<ChangelogTimeline
					releases={releases}
					githubOwner="chitranklabs"
					githubRepo="git-hygiene"
					allowedGroups={[
						"Features",
						"Bug Fixes",
						"Refactor",
						"Performance",
						"Security",
						"Documentation",
						"Maintenance",
					]}
					maxCommitsPerRelease={8}
				/>

				{/* Bottom Navigation */}
				<div className="mt-ml-16 pt-ml-8 border-t border-border flex items-center justify-between">
					<Button asChild variant="secondary" size="sm">
						<Link href="/">← Return to Homepage</Link>
					</Button>
					<Button asChild variant="secondary" size="sm">
						<a
							href="https://github.com/chitranklabs/git-hygiene/releases"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub Releases ↗
						</a>
					</Button>
				</div>
			</Container>
		</div>
	)
}
