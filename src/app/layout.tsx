import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { ToastProvider } from '@/components/ui/Toast'
import { SiteChrome } from '@/components/layout/SiteChrome'
import { JsonLd } from '@/components/seo/JsonLd'
import { site } from '@/lib/site'

const display = Cormorant_Garamond({
	variable: '--font-cormorant',
	subsets: ['latin'],
	weight: ['400', '500', '600'],
})

const body = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
})

const defaultTitle = `${site.name} — ${site.tagline}`
const defaultOgImage = `${site.url}/karoo/hero.jpg`

export const metadata: Metadata = {
	metadataBase: new URL(site.url),
	title: {
		default: defaultTitle,
		template: `%s — ${site.name}`,
	},
	description: site.description,
	keywords: [
		'fabric shop South Africa',
		'buy fabric online',
		'satin fabric',
		'dressmaking fabric',
		'fabric by the metre',
		site.name,
	],
	alternates: {
		canonical: '/',
	},
	openGraph: {
		type: 'website',
		siteName: site.name,
		title: defaultTitle,
		description: site.description,
		url: site.url,
		locale: site.locale.replace('-', '_'),
		images: [{ url: defaultOgImage, width: 1200, height: 630, alt: site.name }],
	},
	twitter: {
		card: 'summary_large_image',
		title: defaultTitle,
		description: site.description,
		images: [defaultOgImage],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: { index: true, follow: true },
	},
}

export const viewport: Viewport = {
	themeColor: '#f5f1ea',
	width: 'device-width',
	initialScale: 1,
}

// Sitewide entities — repeated on every page so crawlers always have a fixed
// point to associate the store's products/reviews/breadcrumbs with, without
// depending on the homepage being the one that's crawled.
const organizationJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: site.name,
	url: site.url,
	logo: `${site.url}/favicon.ico`,
	...(Object.values(site.social).some((v) => v !== '#') && {
		sameAs: Object.values(site.social).filter((v) => v !== '#'),
	}),
	contactPoint: {
		'@type': 'ContactPoint',
		email: site.email,
		telephone: site.phones[0],
		contactType: 'customer service',
		areaServed: 'BW',
	},
}

const websiteJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: site.name,
	url: site.url,
	potentialAction: {
		'@type': 'SearchAction',
		target: `${site.url}/shop?search={search_term_string}`,
		'query-input': 'required name=search_term_string',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="en"
			className={`${display.variable} ${body.variable} h-full`}
		>
			<body className="min-h-full flex flex-col">
				<JsonLd data={organizationJsonLd} />
				<JsonLd data={websiteJsonLd} />
				<AuthProvider>
					<CartProvider>
						<ToastProvider>
							<SiteChrome>{children}</SiteChrome>
						</ToastProvider>
					</CartProvider>
				</AuthProvider>
			</body>
		</html>
	)
}
