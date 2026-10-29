"use client"

import { ThemeSwitcher } from "@/src/components/ui"
import { useTheme } from "./theme-provider"

export function ThemeControl() {
	const { theme, toggleTheme } = useTheme()

	return (
		<ThemeSwitcher
			theme={theme}
			size="sm"
			onThemeChange={toggleTheme}
		/>
	)
}
