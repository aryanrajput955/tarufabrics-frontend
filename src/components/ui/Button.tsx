import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
	'inline-flex items-center justify-center gap-2 font-sans uppercase tracking-[0.15em] text-xs transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none rounded-sm cursor-pointer'

const variants: Record<Variant, string> = {
	primary:
		'bg-ink text-canvas hover:bg-accent-dark border border-ink hover:border-accent-dark',
	outline:
		'bg-transparent text-ink border border-ink hover:bg-ink hover:text-canvas',
	ghost: 'bg-transparent text-ink hover:text-accent border border-transparent',
}

const sizes: Record<Size, string> = {
	sm: 'h-9 px-4',
	md: 'h-11 px-6',
	lg: 'h-13 px-8 py-4',
}

interface CommonProps {
	variant?: Variant
	size?: Size
	loading?: boolean
	children: ReactNode
	className?: string
}

function classes(v: Variant, s: Size, extra?: string) {
	return [base, variants[v], sizes[s], extra].filter(Boolean).join(' ')
}

export function Button({
	variant = 'primary',
	size = 'md',
	loading = false,
	children,
	className,
	disabled,
	...props
}: CommonProps & ComponentProps<'button'>) {
	return (
		<button
			className={classes(variant, size, className)}
			disabled={disabled || loading}
			{...props}
		>
			{loading && <Spinner />}
			{children}
		</button>
	)
}

export function ButtonLink({
	variant = 'primary',
	size = 'md',
	children,
	className,
	...props
}: CommonProps & ComponentProps<typeof Link>) {
	return (
		<Link className={classes(variant, size, className)} {...props}>
			{children}
		</Link>
	)
}

function Spinner() {
	return (
		<span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
	)
}
