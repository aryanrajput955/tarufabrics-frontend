import type { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/LegalLayout'
import { site } from '@/lib/site'

export const metadata: Metadata = {
	title: 'Terms of Service',
	description: 'The terms that govern your use of the Taru Fabrics website and orders.',
	alternates: { canonical: '/terms' },
}

export default function TermsPage() {
	return (
		<LegalLayout eyebrow="Legal" title="Terms of Service" updated="24 July 2026">
			<p>
				These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the
				Taru Fabrics website and any purchase you make with us. By placing an order
				or creating an account, you agree to these Terms.
			</p>

			<h2>Products &amp; Pricing</h2>
			<p>
				Taru Fabrics is a South African fabric house, and all fabrics are priced per
				metre in South African Rand (R). We make reasonable efforts to ensure prices and
				product descriptions are accurate, but errors may occasionally occur.
				We reserve the right to correct pricing errors and, where necessary,
				cancel affected orders with a full refund.
			</p>

			<h2>Orders &amp; Payment</h2>
			<p>
				Orders are confirmed once payment is successfully processed through
				our payment partner, PayFast. Every order is cut to the exact length
				you request, so please review your quantity carefully before
				checking out.
			</p>

			<h2>Shipping</h2>
			<p>
				Shipping timelines, costs and coverage are described on our{' '}
				<a href="/shipping-returns">Shipping &amp; Returns</a> page, which
				forms part of these Terms.
			</p>

			<h2>Returns &amp; Cancellations</h2>
			<p>
				Because fabric is cut specifically for your order, cut lengths are
				generally final sale except in the case of damage or a fulfilment
				error on our part. Full details are available on our{' '}
				<a href="/shipping-returns">Shipping &amp; Returns</a> page.
			</p>

			<h2>Account Responsibilities</h2>
			<p>
				You are responsible for maintaining the confidentiality of your
				account credentials and for all activity that occurs under your
				account. Please notify us immediately if you suspect unauthorised
				use of your account.
			</p>

			<h2>Intellectual Property</h2>
			<p>
				All content on this site — including photography, text, branding and
				page design — is the property of Taru Fabrics and may not be reproduced
				without prior written permission.
			</p>

			<h2>Limitation of Liability</h2>
			<p>
				Taru Fabrics is not liable for indirect, incidental or consequential damages
				arising from the use of our website or products, to the fullest
				extent permitted by law.
			</p>

			<h2>Governing Law</h2>
			<p>
				These Terms are governed by the laws of South Africa, and any disputes
				will be subject to the exclusive jurisdiction of the courts of South
				Africa.
			</p>

			<h2>Changes to These Terms</h2>
			<p>
				We may update these Terms from time to time. Continued use of the
				site after changes are posted constitutes acceptance of the revised
				Terms.
			</p>

			<h2>Contact Us</h2>
			<p>
				Questions about these Terms can be sent to{' '}
				<a href={`mailto:${site.email}`}>{site.email}</a>.
			</p>
		</LegalLayout>
	)
}
