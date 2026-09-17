import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'
import { api } from '@/lib/api'
import type { Category, Product } from '@/lib/types'

// Revalidate the generated sitemap at most once an hour — catalog changes
// don't need to be reflected within seconds, and this avoids hitting the
// backend on every crawler request.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date()

	const staticRoutes: MetadataRoute.Sitemap = [
		{ url: `${site.url}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
		{ url: `${site.url}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
		{ url: `${site.url}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
		{ url: `${site.url}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
		{ url: `${site.url}/size-guide`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
		{ url: `${site.url}/shipping-returns`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
		{ url: `${site.url}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
		{ url: `${site.url}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
	]

	// Best-effort: an unreachable backend at build time should still produce a
	// valid sitemap of the static pages rather than fail the whole build.
	try {
		const [categoriesRes, productsRes] = await Promise.all([
			api.get<Category[]>('/api/categories'),
			api.get<Product[]>('/api/products?limit=1000'),
		])

		const categoryRoutes: MetadataRoute.Sitemap = (categoriesRes.data ?? []).map((c) => ({
			url: `${site.url}/shop/${c.slug}`,
			lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
			changeFrequency: 'weekly',
			priority: 0.7,
		}))

		const productRoutes: MetadataRoute.Sitemap = (productsRes.data ?? []).map((p) => ({
			url: `${site.url}/product/${p.slug}`,
			lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
			changeFrequency: 'weekly',
			priority: 0.8,
		}))

		return [...staticRoutes, ...categoryRoutes, ...productRoutes]
	} catch {
		return staticRoutes
	}
}
