'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { site } from '@/lib/site'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

export function Header() {
	const { user } = useAuth()
	const { cart, openDrawer } = useCart()
	const pathname = usePathname()
	const [open, setOpen] = useState(false)
	const isHome = pathname === '/'

	// On the homepage the header floats transparently over the full-screen
	// hero until the user scrolls, then it solidifies. Every other page keeps
	// the normal solid, in-flow header.
	const [scrolled, setScrolled] = useState(!isHome)

	useEffect(() => {
		if (!isHome) {
			setScrolled(true)
			return
		}
		const onScroll = () => setScrolled(window.scrollY > 24)
		onScroll()
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [isHome])

	const overlay = isHome && !scrolled
	const linkColor = overlay ? 'text-white' : 'text-ink'
	const mutedLinkColor = overlay ? 'text-white/90' : 'text-ink'

	return (
		<header
			className={`z-50 transition-colors duration-300 ${
				isHome ? 'fixed inset-x-0 top-0' : 'sticky top-0'
			} ${
				overlay
					? 'bg-transparent border-b border-transparent'
					: 'bg-canvas/90 backdrop-blur border-b border-line'
			}`}
		>
			<div className="container-page flex items-center justify-between h-16 md:h-20">
				{/* Mobile menu toggle */}
				<button
					className="md:hidden -ml-1 p-2 cursor-pointer"
					onClick={() => setOpen((o) => !o)}
					aria-label="Menu"
				>
					<span className={`block w-5 h-px mb-1 transition-colors ${overlay ? 'bg-white' : 'bg-ink'}`} />
					<span className={`block w-5 h-px mb-1 transition-colors ${overlay ? 'bg-white' : 'bg-ink'}`} />
					<span className={`block w-5 h-px transition-colors ${overlay ? 'bg-white' : 'bg-ink'}`} />
				</button>

				{/* Left nav (desktop) */}
				<nav className="hidden md:flex items-center gap-8 flex-1">
					{site.nav.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={`text-xs uppercase tracking-[0.18em] link-underline transition-colors ${
								pathname.startsWith(item.href) ? 'text-accent' : mutedLinkColor
							}`}
						>
							{item.label}
						</Link>
					))}
				</nav>

				{/* Brand */}
				<Link
					href="/"
					className="text-center flex-1 md:flex-none"
					aria-label={site.name}
				>
					<span
						className={`font-display text-lg sm:text-2xl md:text-3xl tracking-[0.06em] sm:tracking-[0.1em] whitespace-nowrap transition-colors ${linkColor}`}
					>
						{site.name}
					</span>
				</Link>

				{/* Right actions */}
				<div className="flex items-center gap-5 flex-1 justify-end">
					<Link
						href={user ? '/account' : '/login'}
						className={`text-xs uppercase tracking-[0.18em] link-underline transition-colors ${mutedLinkColor}`}
					>
						{user ? 'Account' : 'Login'}
					</Link>
					<button
						onClick={openDrawer}
						className={`text-xs uppercase tracking-[0.18em] link-underline inline-flex items-center gap-1.5 transition-colors cursor-pointer ${mutedLinkColor}`}
					>
						Cart
						{cart.totalItems > 0 && (
							<span
								className={`inline-flex items-center justify-center min-w-[1.15rem] h-[1.15rem] px-1 rounded-full text-[0.6rem] leading-none tracking-normal transition-colors ${
									overlay ? 'bg-white text-ink' : 'bg-ink text-canvas'
								}`}
							>
								{cart.totalItems}
							</span>
						)}
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			{open && (
				<nav className="md:hidden border-t border-line bg-canvas">
					<div className="container-page py-4 flex flex-col gap-4">
						{site.nav.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setOpen(false)}
								className="text-sm uppercase tracking-[0.18em] text-ink"
							>
								{item.label}
							</Link>
						))}
					</div>
				</nav>
			)}
		</header>
	)
}
