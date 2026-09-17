import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { site } from '@/lib/site'

export function AuthShell({
	title,
	subtitle,
	children,
	footer,
	image = '/karoo/hero.jpg',
}: {
	title: string
	subtitle?: string
	children: ReactNode
	footer?: ReactNode
	image?: string
}) {
	return (
		<div className="grid lg:grid-cols-2 lg:min-h-[calc(100vh-5rem)]">
			{/* Image panel */}
			<div className="relative hidden lg:block overflow-hidden">
				<Image
					src={image}
					alt=""
					fill
					sizes="50vw"
					priority
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
				<div className="relative h-full flex flex-col justify-between p-12">
					<span className="font-display text-2xl tracking-[0.1em] text-white">
						{site.name}
					</span>
					<p className="font-display text-3xl text-white leading-snug max-w-sm text-balance">
						Fine fabrics, woven from the heart of South Africa.
					</p>
				</div>
			</div>

			{/* Form panel */}
			<div className="flex items-center justify-center px-6 py-12 md:py-20">
				<div className="w-full max-w-sm">
					<Link
						href="/"
						className="font-display text-2xl tracking-[0.1em] text-ink lg:hidden block text-center mb-8"
					>
						{site.name}
					</Link>
					<div className="mb-8">
						<h1 className="font-display text-3xl md:text-4xl text-ink">{title}</h1>
						{subtitle && <p className="text-sm text-muted mt-2.5">{subtitle}</p>}
					</div>
					{children}
					{footer && (
						<div className="text-center mt-7 text-sm text-ink-soft">{footer}</div>
					)}
				</div>
			</div>
		</div>
	)
}
