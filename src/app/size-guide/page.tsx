import type { Metadata } from 'next'
import Image from 'next/image'
import { ButtonLink } from '@/components/ui/Button'

export const metadata: Metadata = {
	title: 'Fabric & Measuring Guide',
	description:
		'How wide our fabrics run, and how many metres to order for your project.',
	alternates: { canonical: '/size-guide' },
}

const PROJECTS: { project: string; metres: string }[] = [
	{ project: 'Cushion cover (45 × 45cm)', metres: '0.5 m' },
	{ project: 'Table runner', metres: '1 m' },
	{ project: 'Curtain panel, standard drop', metres: '2.5–3 m' },
	{ project: 'Adult shirt or dress', metres: '2–2.5 m' },
	{ project: 'Two-seater sofa reupholstery', metres: '6–8 m' },
	{ project: 'Throw or bedspread', metres: '3 m' },
]

const CONVERSIONS: { a: string; b: string }[] = [
	{ a: '1 metre', b: '1.094 yards' },
	{ a: '1 yard', b: '0.914 metres' },
	{ a: '1 cm', b: '0.394 inches' },
	{ a: '1 inch', b: '2.54 cm' },
]

export default function SizeGuidePage() {
	return (
		<div>
			{/* Hero */}
			<section className="relative h-[38vh] min-h-64 flex items-end overflow-hidden">
				<Image
					src="/karoo/linen.jpg"
					alt="Close-up of woven linen texture"
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
				<div className="relative container-page pb-10 md:pb-14">
					<p className="eyebrow mb-3 text-white/75">Customer Care</p>
					<h1 className="font-display text-4xl md:text-6xl leading-[0.98] text-white text-balance">
						Fabric &amp; Measuring Guide
					</h1>
				</div>
			</section>

			<div className="container-page py-16 md:py-24">
				<div className="max-w-2xl mx-auto">
					<h2 className="font-display text-2xl text-ink mb-3">
						Understanding Fabric Width
					</h2>
					<p className="text-ink-soft leading-relaxed mb-10">
						Most Taru Fabrics fabrics are woven to a standard width of{' '}
						<strong className="text-ink">140cm (55in)</strong>, though this
						can vary slightly by weave — the exact width for each fabric is
						noted on its product page. All prices and quantities on our site
						are for the full width of the fabric, sold by the running metre.
					</p>

					<h2 className="font-display text-2xl text-ink mb-3">
						How Much Fabric Do I Need?
					</h2>
					<p className="text-ink-soft leading-relaxed mb-6">
						As a starting point, here&apos;s roughly how much fabric common
						projects use at our standard 140cm width. For anything
						structured — like upholstery or tailoring — we&apos;d always
						recommend rounding up slightly, or checking with your maker.
					</p>
					<div className="border border-line mb-10">
						{PROJECTS.map((row, i) => (
							<div
								key={row.project}
								className={`flex items-center justify-between px-5 py-3.5 text-sm ${
									i !== PROJECTS.length - 1 ? 'border-b border-line' : ''
								} ${i % 2 === 1 ? 'bg-surface' : ''}`}
							>
								<span className="text-ink-soft">{row.project}</span>
								<span className="text-ink font-medium tabular-nums">
									{row.metres}
								</span>
							</div>
						))}
					</div>

					<h2 className="font-display text-2xl text-ink mb-3">
						Measurement Conversions
					</h2>
					<div className="grid grid-cols-2 gap-4 mb-10">
						{CONVERSIONS.map((row) => (
							<div
								key={row.a}
								className="border border-line bg-surface px-5 py-4 text-sm"
							>
								<p className="text-ink">{row.a}</p>
								<p className="text-muted mt-0.5">= {row.b}</p>
							</div>
						))}
					</div>

					<div className="border-t border-line pt-10 text-center">
						<h2 className="font-display text-2xl text-ink mb-3">
							Still Unsure?
						</h2>
						<p className="text-ink-soft leading-relaxed mb-6 max-w-md mx-auto">
							Send us your project details and we&apos;ll help you work out
							exactly how much to order.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<ButtonLink href="/contact" size="lg">
								Ask a Question
							</ButtonLink>
							<ButtonLink href="/shop" variant="outline" size="lg">
								Shop Fabrics
							</ButtonLink>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
