import Image from 'next/image'
import { ButtonLink } from '@/components/ui/Button'

export function HomeHero() {
	return (
		<section className="relative h-screen flex items-end overflow-hidden">
			{/* Full-bleed fabric photography */}
			<Image
				src="/karoo/hero.jpg"
				alt="Draped natural linen catching soft light"
				fill
				priority
				sizes="100vw"
				className="object-cover object-center"
			/>
			{/* One continuous gradient — dark enough at the very top for the
			    transparent floating header, easing off through the middle, then
			    darkening again at the bottom for the headline. A single gradient
			    avoids any seam/banding that stacked overlay divs can produce. */}
			<div
				className="absolute inset-0"
				style={{
					backgroundImage:
						'linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 18%, rgba(0,0,0,0.16) 55%, rgba(0,0,0,0.72) 100%)',
				}}
			/>

			<div className="relative container-page pb-16 md:pb-24 w-full">
				<div className="max-w-2xl">
					<p className="eyebrow mb-5 text-white/80">Proudly South African Fine Fabrics</p>
					<h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[0.98] text-white text-balance">
						Woven from the heart of South Africa
					</h1>
					<p className="mt-6 text-white/85 max-w-lg leading-relaxed">
						A curated collection of premium textiles — natural fibres, hand-finished
						weaves and enduring patterns, sold by the metre.
					</p>
					<div className="mt-9 flex flex-col sm:flex-row gap-4">
						<ButtonLink
							href="/shop"
							size="lg"
							className="!bg-white !text-ink !border-white hover:!bg-white/90"
						>
							Shop the Collection
						</ButtonLink>
						<ButtonLink
							href="/about"
							variant="outline"
							size="lg"
							className="!border-white !text-white hover:!bg-white hover:!text-ink"
						>
							Our Story
						</ButtonLink>
					</div>
				</div>
			</div>
		</section>
	)
}
