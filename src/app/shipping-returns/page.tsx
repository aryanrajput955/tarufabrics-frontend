import type { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/LegalLayout'
import { site } from '@/lib/site'

export const metadata: Metadata = {
	title: 'Shipping & Returns',
	description: 'Shipping timelines and our returns policy for cut-to-order fabric.',
	alternates: { canonical: '/shipping-returns' },
}

export default function ShippingReturnsPage() {
	return (
		<LegalLayout
			eyebrow="Customer Care"
			title="Shipping & Returns"
			updated="24 July 2026"
		>
			<h2>Shipping</h2>
			<p>
				Every order is cut to your exact length once it&apos;s placed, so
				please allow <strong>2–4 business days</strong> for your fabric to be
				measured, cut and prepared before it ships. Delivery across South Africa
				typically takes a further <strong>3–7 business days</strong>,
				depending on your location.
			</p>
			<p>
				Shipping is <strong>free</strong> on every order, with no minimum
				spend. Once your order ships, you can track its status at any time
				from <a href="/account/orders">your account</a>.
			</p>

			<h2>Returns &amp; Exchanges</h2>
			<p>
				Because every length of fabric is cut specifically for your order, we
				&apos;re unable to accept returns or exchanges for change-of-mind once
				a piece has been cut. We&apos;d encourage ordering a smaller length
				first if you&apos;re unsure about a colour or weave.
			</p>
			<p>We will always replace or refund an order if:</p>
			<ul>
				<li>The fabric arrives damaged in transit.</li>
				<li>You received the wrong fabric, colour or length.</li>
				<li>There is a genuine manufacturing fault in the weave.</li>
			</ul>

			<h2>Reporting a Damaged or Incorrect Order</h2>
			<p>
				Please contact us within <strong>48 hours</strong> of delivery with
				your order number and a photo of the issue, and we&apos;ll arrange a
				replacement or refund at no extra cost to you.
			</p>

			<h2>Need Help?</h2>
			<p>
				Reach us any time at{' '}
				<a href={`mailto:${site.email}`}>{site.email}</a> or through our{' '}
				<a href="/contact">contact page</a>, and we&apos;ll get back to you
				within one to two business days.
			</p>
		</LegalLayout>
	)
}
