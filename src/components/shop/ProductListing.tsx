'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Product, Category, Pagination } from '@/lib/types'
import { productPrice } from '@/lib/format'
import { Reveal } from '@/components/ui/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { ProductCard, ProductCardSkeleton } from './ProductCard'
import { SortSelect, type SortOption } from './SortSelect'

type Sort = 'newest' | 'price_asc' | 'price_desc'
const PAGE_SIZE = 12

const SORT_OPTIONS: SortOption<Sort>[] = [
	{ value: 'newest', label: 'Newest' },
	{ value: 'price_asc', label: 'Price: Low to High' },
	{ value: 'price_desc', label: 'Price: High to Low' },
]

// Fallback banner when a category has no image of its own yet.
const DEFAULT_HERO = '/karoo/hero.jpg'

export function ProductListing({
	categorySlug,
	heading,
}: {
	categorySlug?: string
	heading?: string
}) {
	const [categories, setCategories] = useState<Category[]>([])
	const [products, setProducts] = useState<Product[]>([])
	const [pagination, setPagination] = useState<Pagination | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [page, setPage] = useState(1)
	const [sort, setSort] = useState<Sort>('newest')
	const [queryInput, setQueryInput] = useState('')
	const [search, setSearch] = useState('')

	// Debounce the search box before it hits the API
	useEffect(() => {
		const t = setTimeout(() => setSearch(queryInput.trim()), 350)
		return () => clearTimeout(t)
	}, [queryInput])

	useEffect(() => {
		api
			.get<Category[]>('/api/categories')
			.then((res) => setCategories(res.data ?? []))
			.catch(() => setCategories([]))
	}, [])

	const activeCategory = useMemo(
		() => categories.find((c) => c.slug === categorySlug),
		[categories, categorySlug]
	)

	useEffect(() => {
		setPage(1)
	}, [categorySlug, search])

	useEffect(() => {
		if (categorySlug && categories.length === 0) return
		setLoading(true)
		setError(null)
		const params = new URLSearchParams()
		params.set('page', String(page))
		params.set('limit', String(PAGE_SIZE))
		if (activeCategory) params.set('category', activeCategory._id)
		if (search) params.set('search', search)

		api
			.get<Product[]>(`/api/products?${params.toString()}`)
			.then((res) => {
				setProducts(res.data ?? [])
				setPagination(res.pagination ?? null)
			})
			.catch((e) => setError(e.message || 'Failed to load fabrics'))
			.finally(() => setLoading(false))
	}, [page, activeCategory, search, categorySlug, categories.length])

	const sorted = useMemo(() => {
		const list = [...products]
		if (sort === 'price_asc') list.sort((a, b) => productPrice(a) - productPrice(b))
		if (sort === 'price_desc') list.sort((a, b) => productPrice(b) - productPrice(a))
		return list
	}, [products, sort])

	const isSearch = Boolean(search)
	const heroImage = activeCategory?.image?.url || DEFAULT_HERO
	const eyebrow = 'The Taru Fabrics Collection'
	const title = heading || activeCategory?.name || 'All Fabrics'
	const subtitle =
		activeCategory?.description ||
		'Premium textiles sourced from South Africa, sold by the metre.'

	return (
		<div>
			{/* ---------- Full-bleed hero ---------- */}
			<section className="relative h-[52vh] min-h-80 flex items-end overflow-hidden">
				<Image
					src={heroImage}
					alt={`${title} fabrics`}
					fill
					priority
					quality={90}
					sizes="100vw"
					className="object-cover object-center"
				/>
				{/* Strong enough to keep white text legible even over near-white
				    fabric photos (e.g. the linen banner). */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/45" />
				{/* Not wrapped in <Reveal> — this is above-the-fold LCP content and
				    must never sit at opacity-0 waiting on an IntersectionObserver. */}
				<div className="relative container-page pb-12 md:pb-16 w-full">
					{activeCategory ? (
						<nav className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-white/70 mb-3">
							<Link href="/shop" className="hover:text-white transition-colors">
								Shop
							</Link>
							<span>/</span>
							<span className="text-white">{title}</span>
						</nav>
					) : (
						<p className="eyebrow mb-3 text-white/75">{eyebrow}</p>
					)}
					<h1 className="font-display text-5xl md:text-7xl leading-[0.98] text-white text-balance">
						{title}
					</h1>
					<p className="mt-4 text-white/85 max-w-md leading-relaxed">{subtitle}</p>
				</div>
			</section>

			{/* ---------- Sticky toolbar ---------- */}
			<div className="sticky top-16 md:top-20 z-40 bg-canvas/90 backdrop-blur border-b border-line">
				<div className="container-page flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-3 md:py-0 md:h-16">
					{/* Category chips */}
					<div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 md:flex-1 md:min-w-0">
						<FilterChip href="/shop" active={!categorySlug}>
							All
						</FilterChip>
						{categories.map((c) => (
							<FilterChip
								key={c._id}
								href={`/shop/${c.slug}`}
								active={categorySlug === c.slug}
							>
								{c.name}
							</FilterChip>
						))}
					</div>

					{/* Search + count + sort */}
					<div className="flex items-center gap-3 md:gap-5 shrink-0">
						<SearchBox value={queryInput} onChange={setQueryInput} />
						<span className="hidden lg:inline h-4 w-px bg-line" />
						<span className="hidden lg:inline text-[0.7rem] uppercase tracking-[0.18em] text-muted tabular-nums whitespace-nowrap">
							{pagination ? `${pagination.total} Fabrics` : ''}
						</span>
						<span className="hidden sm:inline h-4 w-px bg-line" />
						<SortSelect value={sort} options={SORT_OPTIONS} onChange={setSort} />
					</div>
				</div>
			</div>

			{/* ---------- Grid ---------- */}
			<div className="container-page py-14 md:py-20">
				{isSearch && !loading && (
					<p className="mb-8 text-sm text-ink-soft">
						{sorted.length > 0 ? 'Showing results' : 'No results'} for{' '}
						<span className="text-ink">“{search}”</span>
						<button
							onClick={() => setQueryInput('')}
							className="ml-3 text-xs uppercase tracking-[0.15em] text-accent link-underline cursor-pointer"
						>
							Clear
						</button>
					</p>
				)}
				{error ? (
					<p className="text-center text-danger py-20">{error}</p>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-14">
						{loading ? (
							Array.from({ length: PAGE_SIZE }).map((_, i) => (
								<ProductCardSkeleton key={i} />
							))
						) : sorted.length > 0 ? (
							sorted.map((p, i) => (
								<Reveal key={p._id} delay={Math.min(i % PAGE_SIZE, 5) * 60}>
									<ProductCard product={p} />
								</Reveal>
							))
						) : (
							<EmptyState isSearch={isSearch} onClear={() => setQueryInput('')} />
						)}
					</div>
				)}

				{pagination && pagination.pages > 1 && (
					<div className="flex items-center justify-center gap-2 mt-16">
						<button
							disabled={page <= 1}
							onClick={() => setPage((p) => p - 1)}
							className="h-10 px-5 text-xs uppercase tracking-[0.15em] border border-line disabled:opacity-40 hover:border-ink transition-colors cursor-pointer"
						>
							Prev
						</button>
						<span className="px-4 text-xs uppercase tracking-[0.15em] text-ink-soft">
							{page} / {pagination.pages}
						</span>
						<button
							disabled={page >= pagination.pages}
							onClick={() => setPage((p) => p + 1)}
							className="h-10 px-5 text-xs uppercase tracking-[0.15em] border border-line disabled:opacity-40 hover:border-ink transition-colors cursor-pointer"
						>
							Next
						</button>
					</div>
				)}
			</div>

			{/* ---------- Closing editorial band ---------- */}
			<section className="relative overflow-hidden">
				<Image
					src="/karoo/story.jpg"
					alt="Rolls of Taru Fabrics fabric"
					fill
					sizes="100vw"
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-ink/75" />
				<Reveal className="relative container-page py-20 md:py-28 text-center">
					<p className="eyebrow mb-4 text-white/60">Made to be touched</p>
					<h2 className="font-display text-3xl md:text-5xl max-w-2xl mx-auto leading-tight text-balance text-white">
						Every fabric, cut to your length
					</h2>
					<p className="mt-5 text-white/75 max-w-lg mx-auto leading-relaxed">
						Sold by the metre and cut to order, then shipped across South Africa. Have a
						question about a weave or a colour? We&apos;re happy to help.
					</p>
					<div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
						<ButtonLink
							href="/contact"
							size="lg"
							className="!bg-white !text-ink !border-white hover:!bg-white/90"
						>
							Ask a Question
						</ButtonLink>
						<ButtonLink
							href="/about"
							variant="outline"
							size="lg"
							className="!border-white !text-white hover:!bg-white hover:!text-ink"
						>
							Our Story
						</ButtonLink>
					</div>
				</Reveal>
			</section>
		</div>
	)
}

function FilterChip({
	href,
	active,
	children,
}: {
	href: string
	active: boolean
	children: React.ReactNode
}) {
	return (
		<Link
			href={href}
			aria-current={active ? 'page' : undefined}
			className={`whitespace-nowrap text-[0.7rem] uppercase tracking-[0.16em] h-9 px-4 inline-flex items-center border transition-colors ${
				active
					? 'bg-ink text-canvas border-ink'
					: 'bg-transparent text-ink-soft border-line hover:border-ink hover:text-ink'
			}`}
		>
			{children}
		</Link>
	)
}

function SearchBox({
	value,
	onChange,
}: {
	value: string
	onChange: (value: string) => void
}) {
	return (
		<div className="relative w-full sm:w-48 lg:w-56">
			<svg
				viewBox="0 0 20 20"
				className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			>
				<circle cx="8.5" cy="8.5" r="6" />
				<path d="M13.5 13.5L18 18" strokeLinecap="round" />
			</svg>
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Search fabrics…"
				className="w-full h-9 pl-9 pr-8 bg-transparent border border-line text-xs text-ink placeholder:text-muted focus:outline-none focus:border-ink transition-colors"
			/>
			{value && (
				<button
					onClick={() => onChange('')}
					aria-label="Clear search"
					className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer text-sm leading-none"
				>
					×
				</button>
			)}
		</div>
	)
}

function EmptyState({
	isSearch,
	onClear,
}: {
	isSearch: boolean
	onClear: () => void
}) {
	return (
		<div className="col-span-full text-center py-20">
			<p className="font-display text-2xl text-ink mb-2">
				{isSearch ? 'No fabrics match your search' : 'No fabrics here yet'}
			</p>
			<p className="text-muted mb-6">
				{isSearch
					? 'Try a different term, or explore the full collection.'
					: 'Please check back soon.'}
			</p>
			{isSearch ? (
				<button
					onClick={onClear}
					className="text-xs uppercase tracking-[0.18em] text-accent link-underline cursor-pointer"
				>
					Clear Search
				</button>
			) : (
				<Link
					href="/shop"
					className="text-xs uppercase tracking-[0.18em] text-accent link-underline"
				>
					View All Fabrics
				</Link>
			)}
		</div>
	)
}
