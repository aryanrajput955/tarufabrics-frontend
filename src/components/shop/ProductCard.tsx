import Link from 'next/link'
import type { Product } from '@/lib/types'
import { formatPrice, productPrice, productImage } from '@/lib/format'
import { ProductImage } from './ProductImage'
import { StarRating } from '@/components/product/StarRating'

export function ProductCard({ product }: { product: Product }) {
	const price = productPrice(product)
	const hasOffer = product.offer > 0 && price < product.price
	const stock = product.stock ?? 0
	const soldOut = stock <= 0
	const lowStock = !soldOut && stock <= 10
	const categoryName =
		typeof product.category === 'object' && product.category
			? product.category.name
			: product.brand

	return (
		<Link href={`/product/${product.slug}`} className="group block">
			<div className="relative aspect-[4/5] overflow-hidden bg-accent-soft">
				<ProductImage
					src={productImage(product)}
					alt={product.title}
					className="h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
				/>

				{/* Soft darken on hover to lift the CTA */}
				<div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

				{/* Badges */}
				<div className="absolute top-3 left-3 flex flex-col gap-1.5">
					{hasOffer && (
						<span className="bg-ink text-canvas text-[0.6rem] uppercase tracking-[0.18em] px-2.5 py-1">
							{product.offer}% Off
						</span>
					)}
				</div>
				{lowStock && (
					<span className="absolute top-3 right-3 bg-canvas/90 text-ink text-[0.55rem] uppercase tracking-[0.15em] px-2 py-1">
						Only {stock} m left
					</span>
				)}

				{soldOut && (
					<span className="absolute inset-0 flex items-center justify-center bg-canvas/70">
						<span className="text-[0.65rem] uppercase tracking-[0.25em] text-ink border border-ink px-4 py-2">
							Sold Out
						</span>
					</span>
				)}

				{/* Centered CTA on hover */}
				{!soldOut && (
					<div className="absolute inset-x-0 bottom-0 flex justify-center pb-5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
						<span className="bg-canvas text-ink text-[0.62rem] uppercase tracking-[0.22em] px-6 py-3 shadow-sm">
							View Fabric
						</span>
					</div>
				)}
			</div>

			<div className="pt-4">
				<p className="eyebrow mb-1.5">{categoryName}</p>
				<h3 className="font-display text-xl leading-snug text-ink">
					<span className="bg-[length:0%_1px] group-hover:bg-[length:100%_1px] bg-left-bottom bg-no-repeat bg-[linear-gradient(currentColor,currentColor)] transition-[background-size] duration-500">
						{product.title}
					</span>
				</h3>
				{(product.reviewCount ?? 0) > 0 && (
					<div className="mt-1.5 flex items-center gap-1.5">
						<StarRating value={product.ratings} size={12} />
						<span className="text-[0.7rem] text-muted">
							({product.reviewCount})
						</span>
					</div>
				)}
				<div className="mt-2 flex items-baseline gap-2 text-sm">
					<span className={hasOffer ? 'text-accent-dark' : 'text-ink'}>
						{formatPrice(price)}
					</span>
					<span className="text-muted text-xs">/ metre</span>
					{hasOffer && (
						<span className="text-muted line-through ml-0.5 text-xs">
							{formatPrice(product.price)}
						</span>
					)}
				</div>
			</div>
		</Link>
	)
}

export function ProductCardSkeleton() {
	return (
		<div className="animate-pulse">
			<div className="aspect-[4/5] bg-line/60" />
			<div className="pt-4 flex flex-col gap-2.5">
				<div className="h-2 w-16 bg-line/60" />
				<div className="h-5 w-36 bg-line/60" />
				<div className="h-3 w-24 bg-line/60" />
			</div>
		</div>
	)
}
