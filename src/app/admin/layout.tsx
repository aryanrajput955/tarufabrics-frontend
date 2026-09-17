'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { notFound, usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { site } from '@/lib/site'
import {
	DashboardIcon,
	ProductsIcon,
	CategoriesIcon,
	OrdersIcon,
	CouponsIcon,
	UsersIcon,
	StorefrontIcon,
} from '@/components/admin/icons'

const nav = [
	{ label: 'Dashboard', href: '/admin', icon: DashboardIcon },
	{ label: 'Products', href: '/admin/products', icon: ProductsIcon },
	{ label: 'Categories', href: '/admin/categories', icon: CategoriesIcon },
	{ label: 'Orders', href: '/admin/orders', icon: OrdersIcon },
	{ label: 'Coupons', href: '/admin/coupons', icon: CouponsIcon },
	{ label: 'Users', href: '/admin/users', icon: UsersIcon },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const { user, loading, logout } = useAuth()
	const router = useRouter()
	const pathname = usePathname()
	const [mobileNavOpen, setMobileNavOpen] = useState(false)

	// Not signed in → send to login. (Signed-in non-admins are handled below
	// with notFound(), so /admin behaves as if it doesn't exist for them.)
	useEffect(() => {
		if (!loading && !user) {
			router.replace('/login?redirect=/admin')
		}
	}, [loading, user, router])

	// Close the mobile nav automatically whenever the route changes.
	useEffect(() => {
		setMobileNavOpen(false)
	}, [pathname])

	// Auth still resolving, or we're about to bounce to login — show nothing
	// admin-shaped in the meantime.
	if (loading || !user) {
		return (
			<div className="min-h-screen flex items-center justify-center text-muted text-sm">
				Loading…
			</div>
		)
	}

	// Signed in but not an admin: hard 404, no redirect, no admin chrome.
	if (user.role !== 'admin') {
		notFound()
	}

	const activeItem =
		nav.find((item) => (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href))) ??
		nav[0]

	const sidebarContent = (
		<>
			<div className="px-6 py-7 border-b border-canvas/10">
				<span className="font-display text-lg tracking-[0.08em]">{site.name}</span>
				<p className="text-[0.65rem] uppercase tracking-[0.2em] text-canvas/50 mt-1">
					Admin Panel
				</p>
			</div>

			<nav className="flex-1 py-4 overflow-y-auto">
				{nav.map((item) => {
					const active =
						item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
					const Icon = item.icon
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-3 px-6 py-3 text-sm border-l-2 transition-colors ${
								active
									? 'border-accent text-canvas bg-canvas/5'
									: 'border-transparent text-canvas/60 hover:text-canvas hover:bg-canvas/5'
							}`}
						>
							<Icon className="w-[18px] h-[18px] shrink-0" />
							<span className="uppercase tracking-[0.1em] text-xs">{item.label}</span>
						</Link>
					)
				})}
			</nav>

			<div className="px-6 py-5 border-t border-canvas/10 space-y-3">
				<Link
					href="/"
					target="_blank"
					className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-canvas/60 hover:text-canvas transition-colors"
				>
					<StorefrontIcon className="w-4 h-4" />
					View Storefront
				</Link>
				<button
					onClick={() => {
						logout()
						router.push('/')
					}}
					className="w-full h-9 border border-danger text-danger text-xs uppercase tracking-[0.15em] rounded-sm hover:bg-danger hover:text-canvas transition-colors cursor-pointer"
				>
					Sign Out
				</button>
			</div>
		</>
	)

	return (
		<div className="min-h-screen flex bg-canvas">
			{/* Sidebar — static on desktop, a slide-in drawer on mobile */}
			<aside className="hidden md:flex w-60 shrink-0 bg-ink text-canvas flex-col">
				{sidebarContent}
			</aside>

			{/* Mobile top bar */}
			<div className="md:hidden fixed inset-x-0 top-0 z-40 h-14 flex items-center justify-between px-4 bg-ink text-canvas">
				<button
					onClick={() => setMobileNavOpen(true)}
					aria-label="Open menu"
					className="p-2 -ml-2 cursor-pointer"
				>
					<span className="block w-5 h-px mb-1.5 bg-canvas" />
					<span className="block w-5 h-px mb-1.5 bg-canvas" />
					<span className="block w-5 h-px bg-canvas" />
				</button>
				<span className="text-xs uppercase tracking-[0.15em]">{activeItem.label}</span>
				<span className="w-9" />
			</div>

			{/* Mobile drawer */}
			<div
				onClick={() => setMobileNavOpen(false)}
				aria-hidden="true"
				className={`md:hidden fixed inset-0 z-[60] bg-ink/50 transition-opacity duration-300 ${
					mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
				}`}
			/>
			<aside
				className={`md:hidden fixed inset-y-0 left-0 z-[70] w-64 bg-ink text-canvas flex flex-col transition-transform duration-300 ease-out ${
					mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				{sidebarContent}
			</aside>

			{/* Content */}
			<main className="flex-1 min-w-0 px-5 py-8 pt-20 md:pt-10 md:px-12 md:py-10">
				{children}
			</main>
		</div>
	)
}
