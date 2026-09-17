'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Category } from '@/lib/types'
import { Reveal } from '@/components/ui/Reveal'

// How many category tiles to surface on the homepage.
const MAX_TILES = 12

export function MaterialTiles() {
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		api
			.get<Category[]>('/api/categories')
			.then((res) => setCategories(res.data ?? []))
			.catch(() => setCategories([]))
			.finally(() => setLoading(false))
	}, [])

	// Nothing to show — drop the section entirely.
	if (!loading && categories.length === 0) return null

	const tiles = categories.slice(0, MAX_TILES)

	return (
		<section className="container-page py-20 md:py-28">
			<Reveal className="flex items-end justify-between mb-10 md:mb-12">
				<div>
					<p className="eyebrow mb-3">Explore</p>
					<h2 className="font-display text-3xl md:text-5xl text-ink">
						Shop by Fabric
					</h2>
				</div>
				<Link
					href="/shop"
					className="hidden sm:inline text-xs uppercase tracking-[0.18em] link-underline"
				>
					View All
				</Link>
			</Reveal>

			<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
				{loading
					? Array.from({ length: 8 }).map((_, i) => (
							<div
								key={i}
								className="aspect-[3/4] bg-line/40 animate-pulse"
							/>
					  ))
					: tiles.map((c, i) => (
							<Reveal key={c._id} delay={Math.min(i, 6) * 80}>
								<Link
									href={`/shop/${c.slug}`}
									className="group relative block aspect-[3/4] overflow-hidden"
								>
									{c.image?.url ? (
										<Image
											src={c.image.url}
											alt={`${c.name} fabric`}
											fill
											quality={90}
											sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
											className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
										/>
									) : (
										<div
											className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-105"
											style={{
												backgroundColor: c.color,
												backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.18), rgba(0,0,0,0.12))`,
											}}
										/>
									)}
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
									<div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
										<h3 className="font-display text-xl md:text-2xl text-white">
											{c.name}
										</h3>
										{c.description && (
											<p className="mt-1 text-xs md:text-sm text-white/80 line-clamp-2">
												{c.description}
											</p>
										)}
										<span className="mt-3 inline-block text-[0.65rem] uppercase tracking-[0.2em] text-white/90 opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
											Shop {c.name} →
										</span>
									</div>
								</Link>
							</Reveal>
					  ))}
			</div>
		</section>
	)
}
