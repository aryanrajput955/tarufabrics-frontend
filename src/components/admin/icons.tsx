// Small line-icon set for the admin panel (sidebar nav + dashboard quick
// actions). Kept in one file so every icon shares the same stroke weight.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 1.5,
	strokeLinecap: 'round' as const,
	strokeLinejoin: 'round' as const,
}

export function DashboardIcon(props: IconProps) {
	return (
		<svg {...base} {...props}>
			<rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1" />
			<rect x="13" y="3.5" width="7.5" height="4.5" rx="1" />
			<rect x="13" y="10.5" width="7.5" height="10" rx="1" />
			<rect x="3.5" y="13.5" width="7.5" height="7" rx="1" />
		</svg>
	)
}

export function ProductsIcon(props: IconProps) {
	return (
		<svg {...base} {...props}>
			<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z" />
			<path d="M4 7.5 12 12l8-4.5" />
			<path d="M12 12v9" />
		</svg>
	)
}

export function CategoriesIcon(props: IconProps) {
	return (
		<svg {...base} {...props}>
			<path d="M3 6.5 12 3l9 3.5-9 3.5z" />
			<path d="M3 12l9 3.5 9-3.5" />
			<path d="M3 17.5 12 21l9-3.5" />
		</svg>
	)
}

export function OrdersIcon(props: IconProps) {
	return (
		<svg {...base} {...props}>
			<path d="M4 7h16v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
			<path d="M4 7 6 3h12l2 4" />
			<path d="M9 11a3 3 0 0 0 6 0" />
		</svg>
	)
}

export function CouponsIcon(props: IconProps) {
	return (
		<svg {...base} {...props}>
			<path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.75 1.75 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.75 1.75 0 0 0 0-3z" />
			<path d="M9 7v10" strokeDasharray="2.2 2.2" />
		</svg>
	)
}

export function UsersIcon(props: IconProps) {
	return (
		<svg {...base} {...props}>
			<circle cx="9" cy="8" r="3.25" />
			<path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
			<circle cx="17.5" cy="8.5" r="2.5" />
			<path d="M15.5 14.2c2.9.4 5 2.9 5 5.8" />
		</svg>
	)
}

export function StorefrontIcon(props: IconProps) {
	return (
		<svg {...base} {...props}>
			<path d="M4 9.5 5 4h14l1 5.5" />
			<path d="M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
			<path d="M5 10v10h14V10" />
			<path d="M10 20v-5.5a2 2 0 0 1 4 0V20" />
		</svg>
	)
}
