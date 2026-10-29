import type { Identity } from "@/src/lib/identity"
import { siteUrl } from "@/src/lib/seo"

interface Props<T> {
	data: T
}

interface PageJsonLdInput {
	title: string
	description: string
	path: `/${string}`
}

function absoluteUrl(path: `/${string}`) {
	return new URL(path, `${siteUrl}/`).toString()
}

export function getPersonJsonLd(identity: Identity) {
	return {
		"@type": "Person",
		"@id": `${identity.websiteUrl}/#person`,
		name: identity.name,
		alternateName: identity.alternateNames,
		image: identity.portraitUrl,
		url: identity.websiteUrl,
		jobTitle: identity.jobTitle,
		worksFor: {
			"@type": "Organization",
			name: identity.company.name,
			url: identity.company.url,
		},
		alumniOf: {
			"@type": "CollegeOrUniversity",
			name: identity.education,
		},
		nationality: identity.nationality,
		knowsAbout: identity.knowsAbout,
		sameAs: [identity.socials.linkedin, identity.socials.github, identity.websiteUrl],
		mainEntityOfPage: {
			"@id": `${identity.websiteUrl}/#webpage`,
		},
	}
}

export function getWebsiteJsonLd(identity: Identity | null, siteUrl: string) {
	const jsonLd: Record<string, unknown> = {
		"@type": "WebSite",
		"@id": `${siteUrl}/#website`,
		url: siteUrl,
		name: "git-hygiene",
		description:
			"Validate conventional commits, branch names and pull request titles with shared configuration. Use git-hygiene in Git hooks, GitHub Actions or Node.js tooling.",
		about: {
			"@id": `${siteUrl}/#software-source-code`,
		},
		sameAs: [
			"https://github.com/chitranklabs/git-hygiene",
			"https://chitrankagnihotri.com/project/git-hygiene",
		],
	}

	if (identity) {
		const person = { "@id": `${identity.websiteUrl}/#person` }
		jsonLd.publisher = person
		jsonLd.creator = person
	}

	return jsonLd
}

export function getSoftwareSourceCodeJsonLd(
	identity: Identity | null,
	siteUrl: string,
	version: string,
) {
	const jsonLd: Record<string, unknown> = {
		"@type": "SoftwareSourceCode",
		"@id": `${siteUrl}/#software-source-code`,
		name: "git-hygiene",
		alternateName: "@chitrank2050/git-hygiene",
		description:
			"Validate conventional commits, branch names and pull request titles with shared configuration. Use git-hygiene in Git hooks, GitHub Actions or Node.js tooling.",
		url: siteUrl,
		codeRepository: "https://github.com/chitranklabs/git-hygiene",
		programmingLanguage: ["TypeScript", "JavaScript"],
		runtimePlatform: "Node.js 24+",
		applicationCategory: "DeveloperApplication",
		operatingSystem: "Cross-platform",
		license: "https://github.com/chitranklabs/git-hygiene/blob/main/LICENSE",
		sameAs: [
			"https://github.com/chitranklabs/git-hygiene",
			"https://www.npmjs.com/package/@chitrank2050/git-hygiene",
			"https://www.npmjs.com/package/@chitrank2050/git-hygiene-core",
			"https://jsr.io/@chitrank2050/git-hygiene",
			"https://github.com/marketplace/actions/git-hygiene-validator",
			"https://chitrankagnihotri.com/project/git-hygiene",
		],
		downloadUrl: "https://www.npmjs.com/package/@chitrank2050/git-hygiene",
		softwareRequirements: "Node.js >=24.0.0",
		keywords: [
			"git metadata validator",
			"conventional commits",
			"branch naming",
			"git hooks",
			"commit validation",
			"commitlint alternative",
			"github action",
		],
		version,
		isAccessibleForFree: true,
		isRelatedTo: [
			{
				"@type": "SoftwareSourceCode",
				name: "Monoline UI",
				alternateName: "@chitrank2050/monoline-ui",
				url: "https://monolineui.chitrankagnihotri.com",
				codeRepository: "https://github.com/chitranklabs/monoline-ui",
				description:
					"A monochrome-first React component library for personal sites, portfolios, and documentation.",
			},
			{
				"@type": "WebSite",
				name: "Chitrank Agnihotri Portfolio",
				url: "https://chitrankagnihotri.com",
			},
		],
	}

	if (identity) {
		const person = { "@id": `${identity.websiteUrl}/#person` }
		jsonLd.author = person
		jsonLd.creator = person
		jsonLd.maintainer = person
		jsonLd.producer = person
	}

	return jsonLd
}

export function createBreadcrumbJsonLd(items: readonly { name: string; path: `/${string}` }[]) {
	return {
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path),
		})),
	}
}

export function createCollectionPageJsonLd({
	title,
	description,
	path,
	items,
}: PageJsonLdInput & { items: ReadonlyArray<{ name: string; path: `/${string}` }> }) {
	return {
		...createWebPageJsonLd({ title, description, path }),
		"@type": "CollectionPage",
		mainEntity: {
			"@type": "ItemList",
			numberOfItems: items.length,
			itemListElement: items.map((item, index) => ({
				"@type": "ListItem",
				position: index + 1,
				name: item.name,
				url: absoluteUrl(item.path),
			})),
		},
	}
}

export function createWebPageJsonLd({ title, description, path }: PageJsonLdInput) {
	const url = absoluteUrl(path)

	return {
		"@type": "WebPage",
		"@id": `${url}#webpage`,
		url,
		name: title,
		description,
		inLanguage: "en",
		isPartOf: { "@id": `${siteUrl}/#website` },
		about: { "@id": `${siteUrl}/#software-source-code` },
	}
}

function serializeJsonLd<T>(data: T) {
	return JSON.stringify(data).replace(/[<\u2028\u2029]/g, char => {
		switch (char) {
			case "<":
				return "\\u003c"
			case "\u2028":
				return "\\u2028"
			case "\u2029":
				return "\\u2029"
			default:
				return char
		}
	})
}

export default function JsonLd<T>({ data }: Props<T>) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
		/>
	)
}
