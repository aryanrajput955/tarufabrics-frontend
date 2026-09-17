'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Order } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/lib/format'
import { ButtonLink } from '@/components/ui/Button'
import { ProductImage } from '@/components/shop/ProductImage'

export default function AccountOverview() {
	const { user } = useAuth()
	const [orders, setOrders] = useState<Order[] | null>(null)

	useEffect(() => {
		api
			.get<Order[]>('/api/orders')
			.then((res) => setOrders(res.data ?? []))
			.catch(() => setOrders([]))
	}, [])

	if (!user) return null

	const defaultAddress =
		user.addresses?.find((a) => a.isDefault) || user.addresses?.[0]
	const recentOrder = orders?.[0]

	return (
		<div>
			<div className="grid sm:grid-cols-3 gap-4 mb-10">
				<StatCard label="Orders" value={orders ? String(orders.length) : '—'} />
				<StatCard
					label="Saved Addresses"
					value={String(user.addresses?.length ?? 0)}
				/>
				<StatCard label="Member Since" value={memberSince(user.createdAt)} />
			</div>

			<div className="grid md:grid-cols-2 gap-5">
				{/* Most recent order */}
				<div className="border border-line bg-surface p-6">
					<p className="eyebrow mb-4">Most Recent Order</p>
					{recentOrder ? (
						<>
							<div className="flex gap-3">
								<div className="w-14 h-18 bg-accent-soft overflow-hidden shrink-0">
									<ProductImage
										src={recentOrder.items[0]?.image}
										alt={recentOrder.items[0]?.title ?? ''}
										className="h-full w-full"
									/>
								</div>
								<div className="min-w-0">
									<p className="text-ink truncate">
										{recentOrder.items[0]?.title}
										{recentOrder.items.length > 1 &&
											` + ${recentOrder.items.length - 1} more`}
									</p>
									<p className="text-sm text-muted mt-1 capitalize">
										{recentOrder.orderStatus} ·{' '}
										{new Date(recentOrder.createdAt).toLocaleDateString('en-ZA', {
											day: 'numeric',
											month: 'short',
											year: 'numeric',
										})}
									</p>
									<p className="font-display text-xl text-ink mt-2">
										{formatPrice(recentOrder.totalAmount)}
									</p>
								</div>
							</div>
							<Link
								href={`/account/orders/${recentOrder._id}`}
								className="mt-3 inline-block text-xs uppercase tracking-[0.15em] text-accent link-underline"
							>
								View Order
							</Link>
						</>
					) : orders ? (
						<>
							<p className="text-muted text-sm mb-3">No orders yet.</p>
							<Link
								href="/shop"
								className="text-xs uppercase tracking-[0.15em] text-accent link-underline"
							>
								Start Shopping
							</Link>
						</>
					) : (
						<p className="text-muted text-sm">Loading…</p>
					)}
				</div>

				{/* Default address */}
				<div className="border border-line bg-surface p-6">
					<p className="eyebrow mb-4">Default Address</p>
					{defaultAddress ? (
						<>
							<p className="text-ink">{defaultAddress.name}</p>
							<p className="text-sm text-ink-soft mt-1 leading-relaxed">
								{defaultAddress.address}
								<br />
								{defaultAddress.city}, {defaultAddress.state} —{' '}
								{defaultAddress.pincode}
							</p>
						</>
					) : (
						<p className="text-muted text-sm mb-3">No address saved yet.</p>
					)}
					<Link
						href="/account/addresses"
						className="mt-3 inline-block text-xs uppercase tracking-[0.15em] text-accent link-underline"
					>
						Manage Addresses
					</Link>
				</div>
			</div>

			<div className="mt-8 flex flex-wrap gap-4">
				<ButtonLink href="/account/orders" variant="outline">
					View All Orders
				</ButtonLink>
				<ButtonLink href="/shop" variant="ghost">
					Continue Shopping
				</ButtonLink>
			</div>
		</div>
	)
}

function StatCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="border border-line bg-surface p-5 text-center">
			<p className="font-display text-3xl text-ink">{value}</p>
			<p className="eyebrow mt-1.5">{label}</p>
		</div>
	)
}

function memberSince(createdAt?: string) {
	if (!createdAt) return '—'
	return new Date(createdAt).toLocaleDateString('en-ZA', {
		month: 'short',
		year: 'numeric',
	})
}
