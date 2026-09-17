import type { ReactNode } from 'react'

export function LegalLayout({
	eyebrow,
	title,
	updated,
	children,
}: {
	eyebrow: string
	title: string
	updated?: string
	children: ReactNode
}) {
	return (
		<div className="container-page py-16 md:py-24">
			<div className="max-w-2xl mx-auto">
				<p className="eyebrow mb-3">{eyebrow}</p>
				<h1 className="font-display text-4xl md:text-5xl text-ink mb-4">
					{title}
				</h1>
				{updated && (
					<p className="text-xs uppercase tracking-[0.15em] text-muted mb-10">
						Last updated {updated}
					</p>
				)}
				<div
					className="text-ink-soft
					[&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:first:mt-0
					[&_h3]:font-display [&_h3]:text-xl [&_h3]:text-ink [&_h3]:mt-6 [&_h3]:mb-2
					[&_p]:leading-relaxed [&_p]:mb-4
					[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-4
					[&_li]:leading-relaxed
					[&_strong]:text-ink [&_strong]:font-medium
					[&_a]:text-accent [&_a]:link-underline"
				>
					{children}
				</div>
			</div>
		</div>
	)
}
