import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'

export function ProvenanceSection() {
	return (
		<section className="bg-surface border-y border-line">
			<div className="grid md:grid-cols-2 items-stretch">
				{/* Editorial image — real rolled fabric */}
				<Reveal className="relative min-h-[60vh] md:min-h-[80vh]">
					<Image
						src="/karoo/story.jpg"
						alt="Bolts of raw fabric rolled and stacked at the mill"
						fill
						sizes="(max-width: 768px) 100vw, 50vw"
						className="object-cover"
					/>
				</Reveal>

				{/* Copy */}
				<Reveal
					delay={120}
					className="flex items-center px-6 sm:px-10 lg:px-20 py-16 md:py-24"
				>
					<div className="max-w-md">
						<p className="eyebrow mb-4">Origin</p>
						<h2 className="font-display text-3xl md:text-5xl text-ink leading-tight">
							Sourced directly from South African mills
						</h2>
						<p className="mt-6 text-ink-soft leading-relaxed">
							Taru Fabrics works with a small number of family-run mills across South
							Africa, chosen for their commitment to natural fibres and
							traditional weaving techniques passed down through generations.
							Each fabric is selected for its hand, drape and character before
							it ever reaches our collection.
						</p>
						<blockquote className="mt-8 border-l-2 border-accent pl-5">
							<p className="font-display text-xl md:text-2xl text-ink italic leading-snug">
								&ldquo;We don&apos;t just sell fabric — we carry forward a
								craft.&rdquo;
							</p>
						</blockquote>
					</div>
				</Reveal>
			</div>
		</section>
	)
}
