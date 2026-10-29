import Link from "next/link"

import { Button } from "@chitrank2050/monoline-ui/button"
import { Container } from "@chitrank2050/monoline-ui/container"
import { SectionHead } from "@chitrank2050/monoline-ui/section-head"

export default function NotFound() {
	return (
		<Container as="main" className="pt-ml-24 pb-ml-24 text-center">
			<SectionHead
				eyebrow="404 - Not Found"
				title="This page could not be found."
				size="md"
				level={1}
			/>
			<div className="mt-ml-6">
				<Button asChild>
					<Link href="/">
						Return to Homepage
						<Button.Arrow />
					</Link>
				</Button>
			</div>
		</Container>
	)
}
