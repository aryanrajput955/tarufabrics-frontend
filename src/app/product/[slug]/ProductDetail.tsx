'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { Product, ProductVariant } from '@/lib/types'
import { formatPrice, applyOffer, variantLabel, productPrice } from '@/lib/format'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { ProductImage } from '@/components/shop/ProductImage'
import { StarRating } from '@/components/product/StarRating'
import { Reviews } from '@/components/product/Reviews'

export function ProductDetail({ slug }: { slug: string }) {
	const router = useRouter()
	const { user } = useAuth()
	const { addItem, openDrawer } = useCart()
	const { error: toastError } = useToast()

	const [product, setProduct] = useState<Product | null>(null)
	const [loading, setLoading] = useState(true)
	const [notFound, setNotFound] = useState(false)
	const [variant, setVariant] = useState<ProductVariant | null>(null)
	const [activeImage, setActiveImage] = useState(0)
	const [qty, setQty] = useState(1)
	const [adding, setAdding] = useState(false)
	const [openDropdown, setOpenDropdown] = useState<number | null>(0)
	const [reviewSummary, setReviewSummary] = useState<{
		ratings: number
		reviewCount: number
	} | null>(null)

	useEffect(() => {
		setLoading(true)
		setNotFound(false)
		api
			.get<Product>(`/api/products/${slug}`)
			.then((res) => {
				setProduct(res.data ?? null)
				if (res.data?.hasVariants && res.data.variants?.length) {
					setVariant(res.data.variants[0])
				}
			})
			.catch((e) => {
				if (e instanceof ApiError && e.status === 404) setNotFound(true)
			})
			.finally(() => setLoading(false))
	}, [slug])

	const images = useMemo(() => {
		if (variant?.images?.length) return variant.images
		return product?.images ?? []
	}, [product, variant])

	if (loading) {
		return (
			<div className="container-page py-16 grid md:grid-cols-2 gap-12 animate-pulse">
				<div className="aspect-[4/5] bg-line/50" />
				<div className="space-y-4 pt-6">
					<div className="h-3 w-24 bg-line/50" />
					<div className="h-9 w-2/3 bg-line/50" />
					<div className="h-5 w-32 bg-line/50" />
					<div className="h-24 w-full bg-line/50 mt-6" />
				</div>
			</div>
		)
	}

	if (notFound || !product) {
		return (
			<div className="container-page py-32 text-center">
				<h1 className="font-display text-3xl text-ink mb-3">Fabric not found</h1>
				<p className="text-muted mb-6">This fabric may no longer be available.</p>
				<Button onClick={() => router.push('/shop')}>Back to Shop</Button>
			</div>
		)
	}

	const category =
		typeof product.category === 'object' && product.category
			? product.category
			: null
	const price = variant ? applyOffer(variant.price, variant.offer) : productPrice(product)
	const basePrice = variant ? variant.price : product.price
	const hasOffer = price < basePrice
	const offerPct = variant?.offer ?? product.offer
	const stock = variant ? variant.stock : product.stock
	const soldOut = stock <= 0
	const ratings = reviewSummary?.ratings ?? product.ratings
	const reviewCount = reviewSummary?.reviewCount ?? product.reviewCount ?? 0

	const addToCart = async () => {
		if (!user) {
			router.push(`/login?redirect=/product/${slug}`)
			return
		}
		setAdding(true)
		try {
			await addItem(product._id, qty, variant?._id)
			openDrawer()
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not add to cart')
		} finally {
			setAdding(false)
		}
	}

	return (
		<div className="container-page py-8 md:py-14">
			{/* Breadcrumb */}
			<nav className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-muted mb-8">
				<Link href="/shop" className="hover:text-ink transition-colors">
					Shop
				</Link>
				{category && (
					<>
						<span>/</span>
						<Link
							href={`/shop/${category.slug}`}
							className="hover:text-ink transition-colors"
						>
							{category.name}
						</Link>
					</>
				)}
				<span>/</span>
				<span className="text-ink-soft truncate max-w-[50vw]">{product.title}</span>
			</nav>

			<div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
				{/* Gallery — self-start + h-fit so a taller info column can never
				    stretch it; max-h keeps the sticky block within the viewport so
				    it pins cleanly instead of lurching when the info column's
				    height changes (e.g. opening a description dropdown). */}
				<div className="md:sticky md:top-28 md:self-start md:h-fit">
					<div className="relative aspect-[4/5] md:max-h-[calc(100vh-9rem)] overflow-hidden bg-accent-soft">
						<ProductImage
							src={images[activeImage]?.url}
							alt={product.title}
							className="h-full w-full"
						/>
					</div>
					{images.length > 1 && (
						<div className="mt-3 flex gap-3">
							{images.map((img, i) => (
								<button
									key={img.key || i}
									onClick={() => setActiveImage(i)}
									className={`w-20 aspect-[4/5] overflow-hidden border transition-colors ${
										i === activeImage ? 'border-ink' : 'border-line hover:border-ink-soft'
									}`}
								>
									<ProductImage
										src={img.url}
										alt={`${product.title} ${i + 1}`}
										className="h-full w-full"
									/>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Info */}
				<div>
					<p className="eyebrow mb-2">{category?.name || product.brand}</p>
					<h1 className="font-display text-4xl md:text-5xl text-ink leading-[1.05]">
						{product.title}
					</h1>

					{reviewCount > 0 && (
						<a
							href="#reviews"
							className="mt-3 flex items-center gap-2 w-fit hover:opacity-75 transition-opacity"
						>
							<StarRating value={ratings} size={14} />
							<span className="text-xs text-muted">
								{ratings.toFixed(1)} · {reviewCount} review
								{reviewCount === 1 ? '' : 's'}
							</span>
						</a>
					)}

					<div className="mt-5 flex items-baseline gap-3">
						<span className="text-2xl text-ink">{formatPrice(price)}</span>
						<span className="text-sm text-muted">/ metre</span>
						{hasOffer && (
							<>
								<span className="text-muted line-through text-base">
									{formatPrice(basePrice)}
								</span>
								<span className="text-[0.65rem] uppercase tracking-[0.15em] text-danger border border-danger px-2 py-0.5">
									Save {offerPct}%
								</span>
							</>
						)}
					</div>

					<p className="mt-6 text-ink-soft leading-relaxed">{product.description}</p>

					{/* Variants */}
					{product.hasVariants && product.variants.length > 0 && (
						<div className="mt-8">
							<p className="text-xs uppercase tracking-[0.15em] text-ink-soft mb-3">
								Options
							</p>
							<div className="flex flex-wrap gap-2">
								{product.variants.map((v) => (
									<button
										key={v._id}
										onClick={() => {
											setVariant(v)
											setActiveImage(0)
										}}
										disabled={v.stock <= 0}
										className={`px-4 h-10 text-xs uppercase tracking-[0.1em] border transition-colors disabled:opacity-40 disabled:line-through cursor-pointer ${
											variant?._id === v._id
												? 'border-ink bg-ink text-canvas'
												: 'border-line text-ink hover:border-ink'
										}`}
									>
										{variantLabel(v)}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Length + add */}
					<div className="mt-8">
						<label className="block text-xs uppercase tracking-[0.15em] text-ink-soft mb-2">
							Length (metres)
						</label>
						<div className="flex items-center gap-4">
							<div className="flex items-center border border-line h-12">
								<button
									onClick={() => setQty((q) => Math.max(1, q - 1))}
									disabled={qty <= 1}
									className="w-11 h-full text-lg text-ink hover:text-accent disabled:opacity-30 cursor-pointer"
									aria-label="Decrease length"
								>
									−
								</button>
								<span className="w-12 text-center text-sm tabular-nums">{qty} m</span>
								<button
									onClick={() => setQty((q) => Math.min(stock || 99, q + 1))}
									disabled={qty >= stock}
									className="w-11 h-full text-lg text-ink hover:text-accent disabled:opacity-30 cursor-pointer"
									aria-label="Increase length"
								>
									+
								</button>
							</div>
							<Button
								onClick={addToCart}
								loading={adding}
								disabled={soldOut}
								size="lg"
								className="flex-1"
							>
								{soldOut ? 'Sold Out' : 'Add to Cart'}
							</Button>
						</div>
						<p className="mt-3 text-xs uppercase tracking-[0.15em] text-muted">
							{soldOut ? (
								'Currently unavailable'
							) : stock <= 10 ? (
								<span className="text-accent-dark">Only {stock} metres left</span>
							) : (
								'In stock · cut to order'
							)}
						</p>
					</div>

					{/* Reassurance */}
					<ul className="mt-8 border-t border-line pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-ink-soft">
						<li className="flex flex-col gap-1">
							<span className="text-ink">Free Shipping</span>
							<span className="text-muted">Across South Africa</span>
						</li>
						<li className="flex flex-col gap-1">
							<span className="text-ink">Cut to the Metre</span>
							<span className="text-muted">Precision-cut to order</span>
						</li>
						<li className="flex flex-col gap-1">
							<span className="text-ink">South African</span>
							<span className="text-muted">Traceable origin</span>
						</li>
					</ul>

					{/* Description dropdowns */}
					{product.descriptionDropdowns &&
						product.descriptionDropdowns.length > 0 && (
							<div className="mt-10 border-t border-line">
								{product.descriptionDropdowns.map((d, i) => (
									<div key={i} className="border-b border-line">
										<button
											onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
											className="w-full flex items-center justify-between py-4 text-left text-sm uppercase tracking-[0.12em] text-ink cursor-pointer"
										>
											{d.heading}
											<span className="text-lg">
												{openDropdown === i ? '−' : '+'}
											</span>
										</button>
										{openDropdown === i && (
											<p className="pb-4 text-sm text-ink-soft leading-relaxed">
												{d.content}
											</p>
										)}
									</div>
								))}
							</div>
						)}

					{/* FAQs */}
					{product.faqs && product.faqs.length > 0 && (
						<div className="mt-10">
							<h2 className="font-display text-2xl text-ink mb-4">
								Questions &amp; Answers
							</h2>
							<div className="space-y-4">
								{product.faqs.map((f, i) => (
									<div key={i}>
										<p className="text-sm font-medium text-ink">{f.question}</p>
										<p className="text-sm text-ink-soft mt-1">{f.answer}</p>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="max-w-3xl">
				<Reviews
					productId={product._id}
					ratings={ratings}
					reviewCount={reviewCount}
					onSummaryChange={setReviewSummary}
				/>
			</div>
		</div>
	)
}
