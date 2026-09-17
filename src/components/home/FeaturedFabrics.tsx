import Link from 'next/link'
import type { Product } from '@/lib/types'
import { Reveal } from '@/components/ui/Reveal'
import { ProductCard, ProductCardSkeleton } from '@/components/shop/ProductCard'

export function FeaturedFabrics({
	products,
	loading,
}: {
	products: Product[]
	loading: boolean
}) {
	// Nothing to show yet — hide entirely so the image sections flow together.
	if (!loading && products.length === 0) return null

	return (
		<section className="container-page py-20 md:py-28">
			<Reveal className="flex items-end justify-between mb-12">
				<div>
					<p className="eyebrow mb-3">New Arrivals</p>
					<h2 className="font-display text-3xl md:text-5xl text-ink">
						Latest Fabrics
					</h2>
				</div>
				<Link
					href="/shop"
					className="hidden sm:inline text-xs uppercase tracking-[0.18em] link-underline"
				>
					View All
				</Link>
			</Reveal>

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
				{loading ? (
					Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
				) : products.length > 0 ? (
					products.map((p, i) => (
						<Reveal key={p._id} delay={Math.min(i, 4) * 60}>
							<ProductCard product={p} />
						</Reveal>
					))
				) : (
					<p className="col-span-full text-center text-muted py-12">
						No fabrics available yet. Please check back soon.
					</p>
				)}
			</div>
		</section>
	)
}
