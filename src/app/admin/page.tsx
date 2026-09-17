'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { StatCard } from '@/components/admin/StatCard'
import { Badge } from '@/components/admin/Badge'
import { AdminPageHeader } from '@/components/admin/PageHeader'
import { ProductsIcon, CategoriesIcon, OrdersIcon } from '@/components/admin/icons'
import type { Order, Category } from '@/lib/types'

interface Stats {
	ordersToFulfill: number
	pendingRevenue: number
	deliveredCount: number
	productCount: number
	categoryCount: number
	userCount: number
}

export default function AdminDashboardPage() {
	const [stats, setStats] = useState<Stats | null>(null)
	const [recentOrders, setRecentOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false
		async function load() {
			try {
				const [openOrders, completedOrders, products, categories, users] =
					await Promise.all([
						api.get<Order[]>('/api/admin/orders/all'),
						api.get<Order[]>('/api/admin/orders/completed'),
						api.get<unknown[]>('/api/products?limit=1'),
						api.get<Category[]>('/api/categories'),
						api.get<{ users: unknown[] }>('/api/auth/users'),
					])

				if (cancelled) return

				const open = openOrders.data ?? []
				setStats({
					ordersToFulfill: open.length,
					pendingRevenue: open.reduce((sum, o) => sum + o.totalAmount, 0),
					deliveredCount: (completedOrders.data ?? []).length,
					productCount: products.pagination?.total ?? products.data?.length ?? 0,
					categoryCount: (categories.data ?? []).length,
					userCount: users.data?.users?.length ?? 0,
				})
				setRecentOrders(open.slice(0, 5))
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		load()
		return () => {
			cancelled = true
		}
	}, [])

	const needsSetup = !loading && stats && (stats.categoryCount === 0 || stats.productCount === 0)

	return (
		<div>
			<AdminPageHeader
				eyebrow="Overview"
				title="Dashboard"
				description="A snapshot of your store, plus shortcuts to the things you'll do most: add a fabric, check on an order, or update a category."
			/>

			{loading ? (
				<p className="text-muted text-sm">Loading…</p>
			) : (
				<>
					{needsSetup && (
						<div className="border border-accent/40 bg-accent-soft p-5 mb-8">
							<p className="text-ink font-medium mb-1">Let&apos;s get your storefront ready</p>
							<p className="text-sm text-ink-soft leading-relaxed mb-3">
								Nothing shows up for customers until you have at least one category and
								one product in it. Do these two things first:
							</p>
							<ol className="text-sm text-ink-soft space-y-1 list-decimal list-inside">
								<li>
									{stats?.categoryCount === 0 ? (
										<Link href="/admin/categories" className="text-accent link-underline">
											Add a category
										</Link>
									) : (
										<span className="text-ink">Add a category — done ✓</span>
									)}{' '}
									— e.g. &quot;Dutch Satin&quot; or &quot;Suiting&quot;, the fabric types you sell.
								</li>
								<li>
									{stats?.productCount === 0 ? (
										<Link href="/admin/products/new" className="text-accent link-underline">
											Add a product
										</Link>
									) : (
										<span className="text-ink">Add a product — done ✓</span>
									)}{' '}
									— a fabric within that category, with a price and photos.
								</li>
							</ol>
						</div>
					)}

					{/* Quick actions — the three things an admin does most often */}
					<div className="grid sm:grid-cols-3 gap-4 mb-8">
						<QuickAction
							href="/admin/products/new"
							icon={ProductsIcon}
							label="Add a Product"
							hint="List a new fabric"
						/>
						<QuickAction
							href="/admin/categories"
							icon={CategoriesIcon}
							label="Categories"
							hint="Your fabric types"
						/>
						<QuickAction
							href="/admin/orders"
							icon={OrdersIcon}
							label="Fulfil Orders"
							hint={
								stats && stats.ordersToFulfill > 0
									? `${stats.ordersToFulfill} waiting on you`
									: 'Nothing waiting'
							}
						/>
					</div>

					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
						<StatCard
							label="Orders to Fulfill"
							value={stats?.ordersToFulfill ?? 0}
							hint="Paid, not yet delivered"
						/>
						<StatCard
							label="Pending Revenue"
							value={formatPrice(stats?.pendingRevenue ?? 0)}
							hint="Total value of orders to fulfill"
						/>
						<StatCard
							label="Delivered Orders"
							value={stats?.deliveredCount ?? 0}
							hint="Completed all-time"
						/>
						<StatCard
							label="Products"
							value={stats?.productCount ?? 0}
							hint="All fabrics, active + hidden"
						/>
						<StatCard
							label="Active Categories"
							value={stats?.categoryCount ?? 0}
							hint="Visible on the storefront"
						/>
						<StatCard
							label="Registered Users"
							value={stats?.userCount ?? 0}
							hint="Customers who've signed up"
						/>
					</div>

					<div className="flex items-center justify-between mb-4">
						<div>
							<h2 className="font-display text-xl text-ink">Orders to Fulfill</h2>
							<p className="text-xs text-muted mt-0.5">
								Paid orders waiting to be shipped — newest 5 shown here.
							</p>
						</div>
						<Link
							href="/admin/orders"
							className="text-xs uppercase tracking-[0.15em] text-accent link-underline shrink-0"
						>
							View All
						</Link>
					</div>

					{recentOrders.length === 0 ? (
						<p className="text-muted text-sm border border-line bg-surface p-6">
							No open orders — everything is fulfilled.
						</p>
					) : (
						<div className="border border-line bg-surface overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-line text-left text-xs uppercase tracking-[0.1em] text-muted">
										<th className="px-5 py-3 font-normal">Order</th>
										<th className="px-5 py-3 font-normal">Date</th>
										<th className="px-5 py-3 font-normal">Status</th>
										<th className="px-5 py-3 font-normal text-right">Total</th>
									</tr>
								</thead>
								<tbody>
									{recentOrders.map((o) => (
										<tr key={o._id} className="border-b border-line last:border-0">
											<td className="px-5 py-3">
												<Link
													href={`/admin/orders/${o._id}`}
													className="text-accent link-underline"
												>
													{o.orderNumber}
												</Link>
											</td>
											<td className="px-5 py-3 text-ink-soft">
												{new Date(o.createdAt).toLocaleDateString('en-ZA', {
													day: 'numeric',
													month: 'short',
													year: 'numeric',
												})}
											</td>
											<td className="px-5 py-3">
												<Badge status={o.orderStatus} />
											</td>
											<td className="px-5 py-3 text-ink text-right">
												{formatPrice(o.totalAmount)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</>
			)}
		</div>
	)
}

function QuickAction({
	href,
	icon: Icon,
	label,
	hint,
}: {
	href: string
	icon: (props: { className?: string }) => React.ReactElement
	label: string
	hint: string
}) {
	return (
		<Link
			href={href}
			className="flex items-center gap-4 border border-line bg-surface p-5 hover:border-ink transition-colors group"
		>
			<span className="w-10 h-10 shrink-0 rounded-full bg-accent-soft flex items-center justify-center text-accent-dark">
				<Icon className="w-5 h-5" />
			</span>
			<span className="min-w-0">
				<span className="block text-ink group-hover:text-accent transition-colors">
					{label}
				</span>
				<span className="block text-xs text-muted mt-0.5 truncate">{hint}</span>
			</span>
		</Link>
	)
}
