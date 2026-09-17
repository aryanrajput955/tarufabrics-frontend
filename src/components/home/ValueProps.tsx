import { Reveal } from '@/components/ui/Reveal'
import { IconLeaf, IconMapPin, IconScissors, IconWeave } from './icons'

const items = [
	{
		icon: IconMapPin,
		title: 'South African Origin',
		body: 'Every fabric is traced back to the mill it was woven in.',
	},
	{
		icon: IconLeaf,
		title: 'Natural Fibres',
		body: 'Cotton, wool and linen weaves, chosen for how they age and drape.',
	},
	{
		icon: IconWeave,
		title: 'Hand-Finished Weaves',
		body: 'Traditional techniques, finished by artisans — not machines alone.',
	},
	{
		icon: IconScissors,
		title: 'Cut to the Metre',
		body: 'Order exactly what you need, precision-cut before it ships.',
	},
]

export function ValueProps() {
	return (
		<section className="border-b border-line bg-canvas">
			<div className="container-page py-14 md:py-16">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
					{items.map((item, i) => (
						<Reveal key={item.title} delay={i * 80} className="text-center md:text-left">
							<item.icon className="w-7 h-7 mx-auto md:mx-0 text-accent" />
							<h3 className="mt-4 font-display text-lg text-ink">{item.title}</h3>
							<p className="mt-1.5 text-sm text-ink-soft leading-relaxed">
								{item.body}
							</p>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	)
}
