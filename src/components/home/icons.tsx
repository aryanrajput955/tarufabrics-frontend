import type { SVGProps } from 'react'

const base = {
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 1.25,
	strokeLinecap: 'round' as const,
	strokeLinejoin: 'round' as const,
}

export function IconMapPin(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
			<circle cx="12" cy="10" r="2.75" />
		</svg>
	)
}

export function IconWeave(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="M4 4v16M9 4v16M4 8h16M4 14h16M15 4v16M20 4v16" strokeWidth="1" />
		</svg>
	)
}

export function IconScissors(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<circle cx="6" cy="6" r="2.25" />
			<circle cx="6" cy="18" r="2.25" />
			<path d="M20 4 7.5 13M20 20 7.5 11" />
		</svg>
	)
}

export function IconLeaf(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="M5 19c9 0 14-5 14-14C10 5 5 10 5 19Z" />
			<path d="M5 19c3-6 6-9 12-12" />
		</svg>
	)
}
