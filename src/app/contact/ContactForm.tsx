'use client'

import { useState } from 'react'
import Image from 'next/image'
import { api } from '@/lib/api'
import { site } from '@/lib/site'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'

export function ContactForm() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [sent, setSent] = useState(false)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)
		try {
			await api.post('/api/contact/submit', { name, email, message })
			setSent(true)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not send your message')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div>
			{/* Hero */}
			<section className="relative h-[42vh] min-h-72 flex items-end overflow-hidden">
				<Image
					src="/karoo/contact-hero.jpg"
					alt="Draped grey linen fabric in soft folds"
					fill
					priority
					sizes="100vw"
					className="object-cover"
				/>
				<div
					className="absolute inset-0"
					style={{
						backgroundImage:
							'linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 18%, rgba(0,0,0,0.16) 55%, rgba(0,0,0,0.72) 100%)',
					}}
				/>
				<div className="relative container-page pb-12 md:pb-16">
					<p className="eyebrow mb-3 text-white/75">Get in Touch</p>
					<h1 className="font-display text-5xl md:text-7xl leading-[0.98] text-white text-balance">
						We&apos;d Love to Hear From You
					</h1>
				</div>
			</section>

			{/* Form + info */}
			<section className="container-page py-16 md:py-24">
				<div className="grid md:grid-cols-[1fr_360px] gap-12 lg:gap-20">
					{/* Form */}
					<div>
						<p className="eyebrow mb-3">Send a Message</p>
						<h2 className="font-display text-3xl md:text-4xl text-ink mb-8">
							Questions about a fabric, an order, or a bulk enquiry?
						</h2>

						{sent ? (
							<div className="border border-line bg-surface p-8 text-center">
								<span className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-success text-success mb-5">
									<svg
										width="22"
										height="22"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
									>
										<path
											d="M4 12.5 9.5 18 20 6.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</span>
								<h3 className="font-display text-2xl text-ink mb-2">
									Message sent
								</h3>
								<p className="text-ink-soft leading-relaxed max-w-sm mx-auto">
									Thank you for reaching out — our team will get back to you at{' '}
									{email} within one to two business days.
								</p>
								<button
									onClick={() => {
										setSent(false)
										setName('')
										setEmail('')
										setMessage('')
									}}
									className="mt-6 text-xs uppercase tracking-[0.15em] text-accent link-underline cursor-pointer"
								>
									Send another message
								</button>
							</div>
						) : (
							<form onSubmit={submit} className="space-y-5 max-w-lg">
								<div className="grid sm:grid-cols-2 gap-4">
									<Field label="Full Name" htmlFor="name">
										<Input
											id="name"
											required
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="Your name"
										/>
									</Field>
									<Field label="Email" htmlFor="email">
										<Input
											id="email"
											type="email"
											required
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											placeholder="you@example.com"
										/>
									</Field>
								</div>
								<Field label="Message" htmlFor="message">
									<Textarea
										id="message"
										required
										rows={6}
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										placeholder="Tell us what you're looking for…"
									/>
								</Field>
								{error && <p className="text-sm text-danger">{error}</p>}
								<Button type="submit" loading={loading} size="lg" className="w-full sm:w-auto">
									Send Message
								</Button>
							</form>
						)}
					</div>

					{/* Info panel */}
					<aside className="space-y-8">
						<div>
							<p className="eyebrow mb-3">Email</p>
							<a href={`mailto:${site.email}`} className="text-ink link-underline">
								{site.email}
							</a>
						</div>
						<div>
							<p className="eyebrow mb-3">Phone</p>
							<div className="space-y-1">
								{site.phones.map((phone) => (
									<a
										key={phone}
										href={`tel:${phone.replace(/\s+/g, '')}`}
										className="block text-ink link-underline w-fit"
									>
										{phone}
									</a>
								))}
							</div>
						</div>
						<div>
							<p className="eyebrow mb-3">Visit Us</p>
							<a
								href={site.mapUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-ink link-underline"
							>
								View on Google Maps
							</a>
						</div>
						<div>
							<p className="eyebrow mb-3">Response Time</p>
							<p className="text-ink-soft text-sm leading-relaxed">
								We typically reply within one to two business days.
							</p>
						</div>
						<div>
							<p className="eyebrow mb-3">Follow Along</p>
							<div className="flex gap-4 text-sm text-ink-soft flex-wrap">
								<a href={site.social.instagram} className="link-underline hover:text-ink">
									Instagram
								</a>
								<a href={site.social.pinterest} className="link-underline hover:text-ink">
									Pinterest
								</a>
								<a
									href={site.social.tiktok}
									target="_blank"
									rel="noopener noreferrer"
									className="link-underline hover:text-ink"
								>
									TikTok
								</a>
							</div>
						</div>
					</aside>
				</div>
			</section>
		</div>
	)
}
