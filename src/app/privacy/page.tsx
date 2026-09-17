import type { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/LegalLayout'
import { site } from '@/lib/site'

export const metadata: Metadata = {
	title: 'Privacy Policy',
	description: 'How Taru Fabrics collects, uses and protects your information.',
	alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
	return (
		<LegalLayout eyebrow="Legal" title="Privacy Policy" updated="24 July 2026">
			<p>
				This Privacy Policy explains how Taru Fabrics (&ldquo;we&rdquo;,
				&ldquo;us&rdquo;) collects, uses and protects the information you
				share with us when you browse our site or place an order.
			</p>

			<h2>Information We Collect</h2>
			<p>We collect information you provide directly to us, including:</p>
			<ul>
				<li>Account details — name, email address and phone number.</li>
				<li>
					Shipping addresses saved to your account for faster checkout.
				</li>
				<li>Order history — items purchased, quantities and order totals.</li>
				<li>
					Messages you send us through the contact form, including your
					name, email and the content of your message.
				</li>
			</ul>

			<h2>Payment Information</h2>
			<p>
				All payments are processed securely by our payment partner,{' '}
				<strong>PayFast</strong>. We do not store your card or banking
				details on our servers — PayFast handles this in line with its own
				security and compliance standards.
			</p>

			<h2>How We Use Your Information</h2>
			<ul>
				<li>To process and fulfil your orders, including shipping and support.</li>
				<li>To send order confirmations, OTPs and account-related emails.</li>
				<li>To respond to enquiries submitted through our contact form.</li>
				<li>To improve our products, website and customer experience.</li>
			</ul>

			<h2>Third-Party Services</h2>
			<p>We share limited information with trusted service providers who help us run Taru Fabrics:</p>
			<ul>
				<li>
					<strong>PayFast</strong> — payment processing.
				</li>
				<li>
					<strong>Cloudinary</strong> — hosting of product images and video.
				</li>
				<li>
					<strong>Resend / SMTP email providers</strong> — sending order,
					verification and contact-form emails.
				</li>
			</ul>
			<p>
				These providers only receive the information necessary to perform
				their service and are not permitted to use it for any other purpose.
			</p>

			<h2>Cookies &amp; Local Storage</h2>
			<p>
				We use your browser&apos;s local storage to keep you signed in and to
				remember your shopping cart between visits. We do not use third-party
				advertising or tracking cookies.
			</p>

			<h2>Data Security</h2>
			<p>
				We take reasonable technical measures to protect your information,
				including encrypted password storage and secure connections. No
				method of transmission over the internet is completely secure, and we
				cannot guarantee absolute security.
			</p>

			<h2>Your Rights</h2>
			<p>
				You can view and update your account details, addresses and profile
				at any time from your account settings. To request deletion of your
				account or data, please contact us using the details below.
			</p>

			<h2>Children&apos;s Privacy</h2>
			<p>
				Taru Fabrics is not directed at children under 18, and we do not knowingly
				collect information from children.
			</p>

			<h2>Changes to This Policy</h2>
			<p>
				We may update this Privacy Policy from time to time. Changes will be
				posted on this page with an updated revision date.
			</p>

			<h2>Contact Us</h2>
			<p>
				Questions about this policy can be sent to{' '}
				<a href={`mailto:${site.email}`}>{site.email}</a> or via our{' '}
				<a href="/contact">contact page</a>.
			</p>
		</LegalLayout>
	)
}
