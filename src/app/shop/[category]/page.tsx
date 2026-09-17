import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductListing } from '@/components/shop/ProductListing'
import { api } from '@/lib/api'
import { site, absoluteUrl } from '@/lib/site'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Category } from '@/lib/types'

async function getCategory(slug: string): Promise<Category | null> {
	// Categories have no lookup-by-slug endpoint — the list is small (a
	// dozen or so fabric types), so fetching all and matching is cheap.
	const res = await api.get<Category[]>('/api/categories?includeInactive=true')
	return (res.data ?? []).find((c) => c.slug === slug) ?? null
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ category: string }>
}): Promise<Metadata> {
	const { category: slug } = await params
	const category = await getCategory(slug)
	if (!category) return {}

	const title = `${category.name} Fabric`
	const description =
		category.description ||
		`Shop ${category.name} fabric by the metre — premium textiles from ${site.name}, shipped across South Africa.`
	const url = `/shop/${category.slug}`

	return {
		title,
		description,
		alternates: { canonical: url },
		robots: category.isActive ? undefined : { index: false, follow: false },
		openGraph: {
			type: 'website',
			title,
			description,
			url,
			images: category.image?.url
				? [{ url: absoluteUrl(category.image.url), width: 1200, height: 1500, alt: category.name }]
				: undefined,
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: category.image?.url ? [absoluteUrl(category.image.url)] : undefined,
		},
	}
}

export default async function CategoryPage({
	params,
}: {
	params: Promise<{ category: string }>
}) {
	const { category: slug } = await params
	const category = await getCategory(slug)
	if (!category) notFound()

	const url = `${site.url}/shop/${category.slug}`

	return (
		<>
			<JsonLd
				data={{
					'@context': 'https://schema.org',
					'@type': 'CollectionPage',
					name: `${category.name} Fabric`,
					description: category.description,
					url,
				}}
			/>
			<JsonLd
				data={{
					'@context': 'https://schema.org',
					'@type': 'BreadcrumbList',
					itemListElement: [
						{ '@type': 'ListItem', position: 1, name: 'Shop', item: `${site.url}/shop` },
						{ '@type': 'ListItem', position: 2, name: category.name, item: url },
					],
				}}
			/>
			<ProductListing categorySlug={slug} />
		</>
	)
}
