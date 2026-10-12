import type { Metadata } from "next"

import { SiteFooter } from "@/src/components/site-footer"
import { SiteHeader } from "@/src/components/site-header"
import { ThemeProvider } from "@/src/components/theme-provider"
import { CloudflareAnalytics } from "@/src/components/cloudflare-analytics"
import { monolineFontClassName } from "@/src/lib/fonts"
import { fetchIdentity } from "@/src/lib/identity"
import { siteUrl } from "@/src/lib/seo"

import "./globals.css"

import { socialImage } from "@/src/lib/metadata"

export async function generateMetadata(): Promise<Metadata> {
	const identity = await fetchIdentity()
	const author = identity
		? { name: identity.name, url: identity.websiteUrl }
		: { name: "Chitrank Agnihotri", url: "https://chitrankagnihotri.com" }

	const title = "git-hygiene - Zero-Dependency Git Metadata Validator"
	const description =
		"Enforce conventional commits, branch naming patterns, and PR titles with native Node.js 24+ type-stripping speed. Zero dependencies, pure native performance."

	return {
		metadataBase: new URL(siteUrl),
		title: {
			default: title,
			template: "%s | git-hygiene",
		},
		description,
		keywords: [
			"git-hygiene",
			"git metadata validator",
			"conventional commits",
			"branch naming",
			"git hooks",
			"zero dependency",
			"commitlint alternative",
			"github actions",
			"node 24",
			"type stripping",
		],
		authors: [author],
		creator: author.name,
		publisher: author.name,
		icons: {
			icon: "/icon.png",
			apple: "/apple-icon.png",
		},
		openGraph: {
			type: "website",
			url: siteUrl,
			siteName: "git-hygiene",
			title,
			description,
			locale: "en_US",
			images: [socialImage],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [socialImage],
		},
		appleWebApp: {
			capable: true,
			title: "git-hygiene",
			statusBarStyle: "black-translucent",
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	}
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const isProduction = process.env.NODE_ENV === "production"

	return (
		<html
			lang="en"
			data-theme="dark"
			className={monolineFontClassName}
			suppressHydrationWarning
			data-scroll-behavior="smooth"
		>
			<body
				className="min-h-screen bg-background text-foreground antialiased font-sans"
				suppressHydrationWarning
			>
				<script
					id="gh-theme-init"
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem('gh-theme');var d=document.documentElement;if(t==='light'||t==='dark'){d.setAttribute('data-theme',t);return;}if(window.matchMedia('(prefers-color-scheme: light)').matches){d.setAttribute('data-theme','light');return;}d.setAttribute('data-theme','dark');}catch(e){}})();`,
					}}
				/>
				<ThemeProvider>
					<a className="skip-link" href="#main-content">
						Skip to content
					</a>
					<div className="flex min-h-screen flex-col">
						<SiteHeader />
						<div className="flex-1">{children}</div>
						<SiteFooter />
					</div>
				</ThemeProvider>
				{isProduction && <CloudflareAnalytics />}
			</body>
		</html>
	)
}
