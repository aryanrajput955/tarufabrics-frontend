import Image from 'next/image'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

export function ClosingBand() {
	return (
		<section className="relative overflow-hidden">
			<Image
				src="/karoo/collection.jpg"
				alt="A wall of fabric rolls in many colours"
				fill
				sizes="100vw"
				className="object-cover"
			/>
			<div className="absolute inset-0 bg-ink/75" />
			<Reveal className="relative container-page py-24 md:py-32 text-center">
				<p className="eyebrow mb-4 text-white/60">The Taru Fabrics Difference</p>
				<h2 className="font-display text-3xl md:text-5xl max-w-3xl mx-auto leading-tight text-balance text-white">
					Sourced responsibly, woven to last
				</h2>
				<p className="mt-6 text-white/75 max-w-xl mx-auto leading-relaxed">
					Every bolt in our collection is selected for its craftsmanship and
					character — bringing the texture and warmth of South African textiles
					to your home.
				</p>
				<div className="mt-9">
					<ButtonLink
						href="/shop"
						size="lg"
						className="!bg-white !text-ink !border-white hover:!bg-white/90"
					>
						Explore Fabrics
					</ButtonLink>
				</div>
			</Reveal>
		</section>
	)
}
