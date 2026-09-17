'use client'

import { useState } from 'react'

/**
 * Product image with a graceful fabric-swatch placeholder on missing/broken URLs.
 * Uses a plain <img> for dev robustness (unknown hosts). Switch to next/image in Phase 7.
 */
export function ProductImage({
	src,
	alt,
	className = '',
}: {
	src?: string | null
	alt: string
	className?: string
}) {
	const [failed, setFailed] = useState(false)

	if (!src || failed) {
		return (
			<div
				className={`flex items-center justify-center bg-accent-soft px-1 ${className}`}
				aria-label={alt}
			>
				{/* Short mark — this placeholder also fills tiny thumbnails (admin
				    tables, cart rows), where the full brand name would overflow. */}
				<span className="font-display text-xs sm:text-sm tracking-[0.15em] text-accent/60 text-center leading-tight">
					TARU
				</span>
			</div>
		)
	}

	// eslint-disable-next-line @next/next/no-img-element
	return (
		<img
			src={src}
			alt={alt}
			onError={() => setFailed(true)}
			className={`object-cover ${className}`}
		/>
	)
}
