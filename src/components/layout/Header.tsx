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

	// Close the mobile menu on navigation and stop background scroll while it's open.
	useEffect(() => {
		setOpen(false)
	}, [pathname])

	useEffect(() => {
		if (!open) return
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = ''
		}
	}, [open])

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
					aria-label={open ? 'Close menu' : 'Menu'}
					aria-expanded={open}
				>
					<span
						className={`block w-5 h-px transition-all duration-200 ${overlay ? 'bg-white' : 'bg-ink'} ${
							open ? 'rotate-45 translate-y-[3px]' : 'mb-1.5'
						}`}
					/>
					<span
						className={`block w-5 h-px transition-all duration-200 ${overlay ? 'bg-white' : 'bg-ink'} ${
							open ? '-rotate-45' : ''
						}`}
					/>
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
				<div className="flex items-center gap-4 sm:gap-5 flex-1 justify-end">
					<Link
						href={user ? '/account' : '/login'}
						aria-label={user ? 'Account' : 'Login'}
						className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] link-underline transition-colors ${mutedLinkColor}`}
					>
						<svg viewBox="0 0 24 24" className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" strokeWidth="1.5">
							<circle cx="12" cy="8" r="3.5" />
							<path d="M4.5 20c1.2-3.6 4.2-5.5 7.5-5.5s6.3 1.9 7.5 5.5" strokeLinecap="round" />
						</svg>
						<span className="hidden md:inline">{user ? 'Account' : 'Login'}</span>
					</Link>
					<button
						onClick={openDrawer}
						aria-label="Cart"
						className={`relative inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] link-underline transition-colors cursor-pointer ${mutedLinkColor}`}
					>
						<svg viewBox="0 0 24 24" className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" strokeWidth="1.5">
							<path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20.5 8H6" strokeLinecap="round" strokeLinejoin="round" />
							<circle cx="10" cy="20" r="1.4" />
							<circle cx="17" cy="20" r="1.4" />
						</svg>
						<span className="hidden md:inline">Cart</span>
						{cart.totalItems > 0 && (
							<span
								className={`inline-flex items-center justify-center min-w-[1.15rem] h-[1.15rem] px-1 rounded-full text-[0.6rem] leading-none tracking-normal transition-colors absolute -top-1.5 -right-2 md:static md:top-auto md:right-auto ${
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
				<>
					<button
						aria-label="Close menu"
						onClick={() => setOpen(false)}
						className="md:hidden fixed inset-0 top-16 bg-ink/30 backdrop-blur-[1px]"
					/>
					<nav className="md:hidden absolute inset-x-0 top-full border-t border-line bg-canvas shadow-lg animate-[fadeIn_0.2s_ease]">
						<div className="container-page py-2 flex flex-col divide-y divide-line">
							{site.nav.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setOpen(false)}
									className={`py-4 text-sm uppercase tracking-[0.18em] transition-colors ${
										pathname.startsWith(item.href) ? 'text-accent' : 'text-ink'
									}`}
								>
									{item.label}
								</Link>
							))}
						</div>
					</nav>
				</>
			)}
		</header>
	)
}
