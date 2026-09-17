// Central brand / site config. Change these in one place to re-brand the store.
export const site = {
	name: 'Taru Fabrics',
	tagline: 'Proudly South African Fine Fabrics',
	description:
		'Taru Fabrics is a South African fabric house — a curated collection of premium, locally woven fabrics: natural weaves, rich textures and timeless patterns, sold by the metre.',
	// Public URL this site is deployed at — used for canonical links, sitemap.xml,
	// robots.txt, Open Graph/Twitter image URLs and JSON-LD. Override with
	// NEXT_PUBLIC_SITE_URL in .env (no trailing slash) once you have a domain.
	url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://fabric-ecom.vercel.app').replace(/\/$/, ''),
	currency: 'BWP',
	locale: 'en-BW',
	email: 'support@tarufabrics.com',
	phones: ['+267 71656999', '+267 72645141'],
	mapUrl: 'https://maps.app.goo.gl/ReixBGd8k3oQ6Dvo6',
	social: {
		instagram: '#',
		facebook: '#',
		pinterest: '#',
		tiktok: 'https://www.tiktok.com/@tarufabrics',
	},
	nav: [
		{ label: 'Shop', href: '/shop' },
		{ label: 'About', href: '/about' },
		{ label: 'Contact', href: '/contact' },
	],
}

export type SiteConfig = typeof site

/** Resolve a possibly-relative URL (e.g. a local `/karoo/...` placeholder image)
 *  against the site's public URL — Open Graph/Twitter/JSON-LD all require
 *  absolute URLs, but Cloudinary image URLs are already absolute and pass
 *  through unchanged. */
export function absoluteUrl(path: string): string {
	if (/^https?:\/\//i.test(path)) return path
	return `${site.url}${path.startsWith('/') ? '' : '/'}${path}`
}
