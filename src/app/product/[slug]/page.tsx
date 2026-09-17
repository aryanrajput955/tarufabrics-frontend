import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetail } from './ProductDetail'
import { api, ApiError } from '@/lib/api'
import { site, absoluteUrl } from '@/lib/site'
import { productImage, productPrice, inStock } from '@/lib/format'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Product } from '@/lib/types'

async function getProduct(slug: string): Promise<Product | null> {
	try {
		const res = await api.get<Product>(`/api/products/${slug}`)
		return res.data ?? null
	} catch (e) {
		if (e instanceof ApiError && e.status === 404) return null
		throw e
	}
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	const product = await getProduct(slug)
	if (!product) return {}

	const category = typeof product.category === 'object' ? product.category : null
	const title = `${product.title}${category ? ` — ${category.name}` : ''}`
	const description =
		product.description.length > 160
			? `${product.description.slice(0, 157)}…`
			: product.description
	const image = productImage(product)
	const url = `/product/${product.slug}`

	return {
		title,
		description,
		alternates: { canonical: url },
		// Deactivated products stay reachable by direct link (e.g. for admin
		// preview) but shouldn't turn up in search results.
		robots: product.isActive ? undefined : { index: false, follow: false },
		openGraph: {
			type: 'website',
			title,
			description,
			url,
			images: image ? [{ url: absoluteUrl(image), width: 1000, height: 1250, alt: product.title }] : undefined,
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: image ? [absoluteUrl(image)] : undefined,
		},
	}
}

export default async function ProductPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const product = await getProduct(slug)
	if (!product) notFound()

	const category = typeof product.category === 'object' ? product.category : null
	const url = `${site.url}/product/${product.slug}`
	const image = productImage(product)

	const productJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.title,
		description: product.description,
		sku: product.sku,
		brand: { '@type': 'Brand', name: product.brand || site.name },
		...(image && { image: [absoluteUrl(image)] }),
		...(product.reviewCount &&
			product.reviewCount > 0 && {
				aggregateRating: {
					'@type': 'AggregateRating',
					ratingValue: product.ratings,
					reviewCount: product.reviewCount,
				},
			}),
		offers: {
			'@type': 'Offer',
			url,
			priceCurrency: site.currency,
			price: productPrice(product),
			availability: inStock(product)
				? 'https://schema.org/InStock'
				: 'https://schema.org/OutOfStock',
			itemCondition: 'https://schema.org/NewCondition',
		},
	}

	return (
		<>
			<JsonLd data={productJsonLd} />
			<JsonLd
				data={{
					'@context': 'https://schema.org',
					'@type': 'BreadcrumbList',
					itemListElement: [
						{ '@type': 'ListItem', position: 1, name: 'Shop', item: `${site.url}/shop` },
						...(category
							? [
									{
										'@type': 'ListItem',
										position: 2,
										name: category.name,
										item: `${site.url}/shop/${category.slug}`,
									},
								]
							: []),
						{
							'@type': 'ListItem',
							position: category ? 3 : 2,
							name: product.title,
							item: url,
						},
					],
				}}
			/>
			<ProductDetail slug={slug} />
		</>
	)
}
