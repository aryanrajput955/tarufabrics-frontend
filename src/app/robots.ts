import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				// Account, checkout and auth flows are per-user/session pages with
				// nothing to index; admin is private. Keep crawl budget on the
				// actual catalog instead.
				disallow: [
					'/admin',
					'/account',
					'/cart',
					'/checkout',
					'/login',
					'/signup',
					'/forgot-password',
				],
			},
		],
		sitemap: `${site.url}/sitemap.xml`,
	}
}
