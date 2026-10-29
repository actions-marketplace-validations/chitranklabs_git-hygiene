"use client"

import { useState } from "react"

export function InstallCommand({
	command = "pnpm add -D @chitrank2050/git-hygiene",
	className = "",
}: {
	command?: string
	className?: string
}) {
	const [copied, setCopied] = useState(false)

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(command)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			// ignore
		}
	}

	return (
		<button
			type="button"
			onClick={copy}
			title="Click to copy install command"
			aria-label={copied ? "Copied install command to clipboard" : `Copy install command: ${command}`}
			className={`group gh-glass gh-interactive inline-flex items-center justify-between gap-3.5 rounded-xl px-4 py-2.5 font-mono text-xs text-text cursor-pointer hover:border-accent/60 ${className}`}
		>
			<div className="flex items-center gap-2 truncate">
				<span className="text-accent font-semibold select-none">$</span>
				<code className="text-text font-mono font-medium truncate">{command}</code>
			</div>
			<span
				className={`shrink-0 rounded-md px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider transition-all duration-150 ${
					copied
						? "bg-accent text-accent-foreground shadow-xs font-bold scale-105"
						: "bg-surface-2 text-text-muted group-hover:text-text group-hover:bg-surface-3"
				}`}
			>
				{copied ? "✓ Copied" : "Copy"}
			</span>
			<span className="sr-only" aria-live="polite">
				{copied ? "Copied command to clipboard" : ""}
			</span>
		</button>
	)
}
