import type { Metadata } from 'next'
import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import {
	IconLeaf,
	IconMapPin,
	IconScissors,
	IconWeave,
} from '@/components/home/icons'

export const metadata: Metadata = {
	title: 'Our Story',
	description:
		'Taru Fabrics is a South African fabric house, partnering directly with family-run mills across the country — the story behind our collection.',
	alternates: { canonical: '/about' },
}

const values = [
	{
		icon: IconMapPin,
		title: 'Traceable Origin',
		body: 'Every bolt is tied back to the specific mill and region it was woven in — nothing anonymous, nothing mass-market.',
	},
	{
		icon: IconLeaf,
		title: 'Natural Fibres Only',
		body: 'Linen, cotton and wool, chosen for how they breathe, drape and age — never synthetic shortcuts.',
	},
	{
		icon: IconWeave,
		title: 'Hand-Finished Weaves',
		body: 'Traditional techniques passed through generations, finished by hand where it matters most.',
	},
	{
		icon: IconScissors,
		title: 'Cut to the Metre',
		body: 'No overproduction. Every order is cut precisely to length, on demand.',
	},
]

const process = [
	{
		n: '01',
		title: 'Sourced',
		body: 'We work with a small number of family-run mills across South Africa, chosen for their fibre quality and their commitment to traditional weaving.',
	},
	{
		n: '02',
		title: 'Selected',
		body: 'Every fabric is handled and reviewed before it enters our collection — checked for hand, drape, weight and character.',
	},
	{
		n: '03',
		title: 'Woven & Finished',
		body: 'Looms run slowly, by design. Finishing — hemming, washing, pressing — is done by hand wherever it improves the result.',
	},
	{
		n: '04',
		title: 'Cut to Order',
		body: 'Nothing sits pre-cut on a shelf. Once ordered, your length is measured and cut, then shipped.',
	},
]

export default function AboutPage() {
	return (
		<div>
			{/* Hero */}
			<section className="relative h-[56vh] min-h-96 flex items-end overflow-hidden">
				<Image
					src="/karoo/about/loom.jpg"
					alt="Threads on a traditional weaving loom"
					fill
					priority
					sizes="100vw"
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
				<div className="relative container-page pb-14 md:pb-20">
					<p className="eyebrow mb-3 text-white/75">Our Story</p>
					<h1 className="font-display text-5xl md:text-7xl leading-[0.98] text-white max-w-2xl text-balance">
						Woven with intent, sourced with care
					</h1>
				</div>
			</section>

			{/* Origin narrative */}
			<section className="container-page py-20 md:py-28">
				<div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
					<Reveal className="order-2 md:order-1">
						<p className="eyebrow mb-4">Where We Began</p>
						<h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
							A collection built on one simple idea
						</h2>
						<p className="mt-6 text-ink-soft leading-relaxed">
							Taru Fabrics started with a straightforward frustration: it was nearly
							impossible to buy genuinely good fabric — the kind with real
							fibre, real weight, real history — without going through a dozen
							middlemen who couldn&apos;t tell you where it came from.
						</p>
						<p className="mt-4 text-ink-soft leading-relaxed">
							So we built Taru Fabrics to work directly with the makers. Proudly South
							African, we partner with a small number of family-run mills across
							the country, each chosen
							for their fibre quality and their commitment to weaving
							techniques that have barely changed in generations. What we sell
							is what they make — nothing blended, nothing anonymous.
						</p>
						<blockquote className="mt-8 border-l-2 border-accent pl-5">
							<p className="font-display text-xl md:text-2xl text-ink italic leading-snug">
								&ldquo;We don&apos;t just sell fabric — we carry forward a
								craft.&rdquo;
							</p>
						</blockquote>
					</Reveal>
					<Reveal delay={120} className="order-1 md:order-2">
						<div className="relative aspect-[4/5]">
							<Image
								src="/karoo/about/hands.jpg"
								alt="Hands finishing a hand-woven textile"
								fill
								sizes="(max-width: 768px) 100vw, 50vw"
								className="object-cover"
							/>
						</div>
					</Reveal>
				</div>
			</section>

			{/* Values */}
			<section className="border-y border-line bg-surface">
				<div className="container-page py-14 md:py-16">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
						{values.map((v, i) => (
							<Reveal key={v.title} delay={i * 80}>
								<v.icon className="w-7 h-7 text-accent" />
								<h3 className="mt-4 font-display text-lg text-ink">
									{v.title}
								</h3>
								<p className="mt-1.5 text-sm text-ink-soft leading-relaxed">
									{v.body}
								</p>
							</Reveal>
						))}
					</div>
				</div>
			</section>

			{/* Process */}
			<section className="container-page py-20 md:py-28">
				<Reveal className="text-center mb-14">
					<p className="eyebrow mb-3">How It&apos;s Made</p>
					<h2 className="font-display text-3xl md:text-5xl text-ink">
						From Fibre to Fabric
					</h2>
				</Reveal>
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
					{process.map((step, i) => (
						<Reveal key={step.n} delay={i * 90}>
							<span className="font-display text-4xl text-accent/50">
								{step.n}
							</span>
							<h3 className="mt-3 font-display text-xl text-ink">
								{step.title}
							</h3>
							<p className="mt-2 text-sm text-ink-soft leading-relaxed">
								{step.body}
							</p>
						</Reveal>
					))}
				</div>
			</section>

			{/* Closing CTA */}
			<section className="relative overflow-hidden">
				<Image
					src="/karoo/collection.jpg"
					alt="A wall of fabric rolls in many colours"
					fill
					sizes="100vw"
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-ink/75" />
				<Reveal className="relative container-page py-20 md:py-28 text-center">
					<p className="eyebrow mb-4 text-white/60">Join Us</p>
					<h2 className="font-display text-3xl md:text-5xl max-w-2xl mx-auto leading-tight text-balance text-white">
						See the collection for yourself
					</h2>
					<p className="mt-5 text-white/75 max-w-lg mx-auto leading-relaxed">
						Every fabric we carry is sold by the metre and cut to order —
						explore the full range of linens, cottons and wools.
					</p>
					<div className="mt-9 flex justify-center">
						<ButtonLink
							href="/shop"
							size="lg"
							className="!bg-white !text-ink !border-white hover:!bg-white/90"
						>
							Shop the Collection
						</ButtonLink>
					</div>
				</Reveal>
			</section>
		</div>
	)
}
