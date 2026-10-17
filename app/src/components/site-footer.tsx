import Link from "next/link"

import { Footer } from "@chitrank2050/monoline-ui/footer"

import { getLatestRelease } from "@/src/lib/releases"

const footerGroups = [
	{
		title: "Distribution",
		links: [
			{
				title: "NPM Package",
				href: "https://www.npmjs.com/package/@chitrank2050/git-hygiene",
				external: true,
			},
			{
				title: "JSR Package",
				href: "https://jsr.io/@chitrank2050/git-hygiene",
				external: true,
			},
			{
				title: "GitHub Action",
				href: "https://github.com/marketplace/actions/git-hygiene-validator",
				external: true,
			},
			{
				title: "Core Library",
				href: "https://www.npmjs.com/package/@chitrank2050/git-hygiene-core",
				external: true,
			},
		],
	},
	{
		title: "Resources",
		links: [
			{
				title: "GitHub Repository",
				href: "https://github.com/chitranklabs/git-hygiene",
				external: true,
			},
			{
				title: "Changelog",
				href: "/changelog",
				external: false,
			},
			{
				title: "Security Policy",
				href: "https://github.com/chitranklabs/git-hygiene/blob/main/SECURITY.md",
				external: true,
			},
			{
				title: "Contributing Guide",
				href: "https://github.com/chitranklabs/git-hygiene/blob/main/CONTRIBUTING.md",
				external: true,
			},
		],
	},
	{
		title: "Chitrank Labs",
		links: [
			{
				title: "Chitrank Agnihotri",
				href: "https://chitrankagnihotri.com",
				external: true,
			},
			{
				title: "Monoline UI",
				href: "https://monolineui.chitrankagnihotri.com",
				external: true,
			},
			{
				title: "Portfolio Case Study",
				href: "https://chitrankagnihotri.com/project/git-hygiene",
				external: true,
			},
			{
				title: "GitHub Organization",
				href: "https://github.com/chitranklabs",
				external: true,
			},
			{
				title: "Author Profile",
				href: "https://github.com/chitrank2050",
				external: true,
			},
		],
	},
]

function SiteFooterLink(props: React.ComponentProps<typeof Link>) {
	return <Link {...props} />
}

export async function SiteFooter() {
	const release = await getLatestRelease()

	return (
		<Footer
			className="gh-site-footer"
			brand={
				<Link href="/" className="font-mono font-bold tracking-tight flex items-center gap-2">
					<span className="text-text">git-hygiene</span>
				</Link>
			}
			description="Validate commits, branches and pull request titles with one shared configuration. CLI, Core API and GitHub Action. MIT licensed."
			status={
				<Footer.Status>
					{release.version} · <span className="capitalize">{release.date}</span>
				</Footer.Status>
			}
			columns={footerGroups.map((group) => ({
				title: group.title,
				links: group.links.map((link) => ({
					href: link.href,
					label: link.title,
					external: link.external,
				})),
			}))}
			subscribe={false}
			meta={`© ${new Date().getFullYear()} git-hygiene · MIT license`}
			attribution={
				<span>
					Built by{" "}
					<a
						href="https://chitrankagnihotri.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-text hover:text-accent transition-colors underline underline-offset-4"
					>
						Chitrank Agnihotri
					</a>{" "}
					· Crafted with{" "}
					<a
						href="https://monolineui.chitrankagnihotri.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-text hover:text-accent transition-colors underline underline-offset-4"
					>
						Monoline UI
					</a>
				</span>
			}
			linkComponent={SiteFooterLink}
		/>
	)
}
