'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const nav = [
	{ label: 'Overview', href: '/account' },
	{ label: 'Orders', href: '/account/orders' },
	{ label: 'Addresses', href: '/account/addresses' },
	{ label: 'Profile', href: '/account/profile' },
]

export default function AccountLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const { user, loading, logout } = useAuth()
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		if (!loading && !user) router.replace('/login?redirect=/account')
	}, [loading, user, router])

	if (loading || !user) {
		return (
			<div className="container-page py-24 text-center text-muted">Loading…</div>
		)
	}

	const initial = (user.name && user.name !== 'User' ? user.name : user.email)
		.charAt(0)
		.toUpperCase()

	return (
		<div>
			{/* Account header band */}
			<div className="border-b border-line bg-surface">
				<div className="container-page py-10 md:py-12 flex items-center gap-5">
					<span className="w-14 h-14 rounded-full bg-ink text-canvas font-display text-2xl flex items-center justify-center shrink-0">
						{initial}
					</span>
					<div>
						<p className="eyebrow mb-1">My Account</p>
						<h1 className="font-display text-2xl md:text-3xl text-ink break-words">
							{user.name && user.name !== 'User' ? user.name : user.email}
						</h1>
					</div>
				</div>
			</div>

			<div className="container-page py-12 md:py-16">
				<div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-10 md:gap-14">
					<aside>
						<nav className="flex md:flex-col gap-x-6 gap-y-1 flex-wrap">
							{nav.map((item) => {
								const active =
									item.href === '/account'
										? pathname === '/account'
										: pathname.startsWith(item.href)
								return (
									<Link
										key={item.href}
										href={item.href}
										className={`text-xs uppercase tracking-[0.15em] py-2 md:border-l-2 md:pl-4 transition-colors ${
											active
												? 'text-ink md:border-accent'
												: 'text-muted md:border-transparent hover:text-ink'
										}`}
									>
										{item.label}
									</Link>
								)
							})}
							<button
								onClick={() => {
									logout()
									router.push('/')
								}}
								className="mt-1 md:mt-2 h-9 px-4 border border-danger text-danger text-xs uppercase tracking-[0.15em] rounded-sm text-center hover:bg-danger hover:text-canvas transition-colors cursor-pointer"
							>
								Sign Out
							</button>
						</nav>
					</aside>
					<section>{children}</section>
				</div>
			</div>
		</div>
	)
}
