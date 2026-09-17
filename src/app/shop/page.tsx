import type { Metadata } from 'next'
import { ProductListing } from '@/components/shop/ProductListing'
import { site } from '@/lib/site'

export const metadata: Metadata = {
	title: 'Shop Fabrics',
	description:
		'Browse the full collection of premium fabrics — satins, suiting, lace, brocade and more — sold by the metre and shipped across South Africa.',
	alternates: { canonical: '/shop' },
	openGraph: {
		type: 'website',
		title: `Shop Fabrics — ${site.name}`,
		description:
			'Browse the full collection of premium fabrics — satins, suiting, lace, brocade and more — sold by the metre and shipped across South Africa.',
		url: '/shop',
	},
}

export default function ShopPage() {
	return <ProductListing />
}
