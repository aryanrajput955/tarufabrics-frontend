import Link from 'next/link'
import { site } from '@/lib/site'

export function Footer() {
	return (
		<footer className="mt-24 border-t border-line bg-surface">
			<div className="container-page py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
				<div className="md:col-span-2">
					<span className="font-display text-2xl tracking-[0.1em] text-ink">
						{site.name}
					</span>
					<p className="mt-4 text-sm text-ink-soft max-w-sm leading-relaxed">
						{site.description}
					</p>
				</div>

				<div>
					<h4 className="eyebrow mb-4">Explore</h4>
					<ul className="space-y-2.5 text-sm text-ink-soft">
						<li>
							<Link href="/shop" className="link-underline">
								Shop Fabrics
							</Link>
						</li>
						<li>
							<Link href="/about" className="link-underline">
								Our Story
							</Link>
						</li>
						<li>
							<Link href="/contact" className="link-underline">
								Contact
							</Link>
						</li>
						<li>
							<Link href="/size-guide" className="link-underline">
								Fabric Guide
							</Link>
						</li>
						<li>
							<Link href="/account/orders" className="link-underline">
								Track Order
							</Link>
						</li>
					</ul>
				</div>

				<div>
					<h4 className="eyebrow mb-4">Contact</h4>
					<ul className="space-y-2.5 text-sm text-ink-soft">
						<li>{site.email}</li>
						{site.phones.map((phone) => (
							<li key={phone}>{phone}</li>
						))}
						<li className="pt-2 flex gap-4 flex-wrap">
							<a href={site.social.instagram} className="link-underline">
								Instagram
							</a>
							<a href={site.social.pinterest} className="link-underline">
								Pinterest
							</a>
							<a href={site.social.tiktok} target="_blank" rel="noopener noreferrer" className="link-underline">
								TikTok
							</a>
						</li>
					</ul>
				</div>
			</div>

			<div className="border-t border-line">
				<div className="container-page py-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted">
					<p>
						© {new Date().getFullYear()} {site.name}. {site.tagline}.
					</p>
					<div className="flex gap-5">
						<Link href="/privacy" className="link-underline">
							Privacy
						</Link>
						<Link href="/terms" className="link-underline">
							Terms
						</Link>
						<Link href="/shipping-returns" className="link-underline">
							Shipping &amp; Returns
						</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}
