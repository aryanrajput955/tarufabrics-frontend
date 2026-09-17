import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Consistent header for every admin page: eyebrow + title + a one-line plain
 * -English description of what the page is for, plus an optional back-link
 * and an optional primary action on the right. Having every page explain
 * itself in a sentence is the cheapest fix for "I don't know what this does".
 */
export function AdminPageHeader({
	eyebrow,
	title,
	description,
	backHref,
	backLabel = 'Back',
	action,
}: {
	eyebrow: string
	title: string
	description?: string
	backHref?: string
	backLabel?: string
	action?: ReactNode
}) {
	return (
		<div className="mb-8">
			{backHref && (
				<Link
					href={backHref}
					className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-muted hover:text-ink link-underline mb-4 transition-colors"
				>
					<span aria-hidden>←</span> {backLabel}
				</Link>
			)}
			<div className="flex items-start justify-between gap-4 flex-wrap">
				<div>
					<p className="eyebrow mb-1">{eyebrow}</p>
					<h1 className="font-display text-3xl text-ink">{title}</h1>
					{description && (
						<p className="text-sm text-ink-soft mt-2 max-w-xl leading-relaxed">
							{description}
						</p>
					)}
				</div>
				{action}
			</div>
		</div>
	)
}
