'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Order } from '@/lib/types'
import { formatPrice } from '@/lib/format'
import { ProductImage } from '@/components/shop/ProductImage'

const MAX_THUMBS = 4

const statusStyle: Record<string, string> = {
	processing: 'text-accent border-accent',
	shipped: 'text-ink border-ink',
	delivered: 'text-success border-success',
	cancelled: 'text-danger border-danger',
}

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		api
			.get<Order[]>('/api/orders')
			.then((res) => setOrders(res.data ?? []))
			.catch((e) => setError(e.message))
			.finally(() => setLoading(false))
	}, [])

	return (
		<div>
			<p className="eyebrow mb-2">Order History</p>
			<h1 className="font-display text-3xl md:text-4xl text-ink mb-8">
				Your Orders
			</h1>

			{loading ? (
				<p className="text-muted">Loading orders…</p>
			) : error ? (
				<p className="text-danger">{error}</p>
			) : orders.length === 0 ? (
				<div className="border border-line rounded-sm p-12 text-center bg-surface">
					<p className="text-muted mb-4">You have no orders yet.</p>
					<Link
						href="/shop"
						className="text-sm uppercase tracking-[0.15em] text-accent link-underline"
					>
						Start Shopping
					</Link>
				</div>
			) : (
				<div className="space-y-4">
					{orders.map((order) => (
						<Link
							key={order._id}
							href={`/account/orders/${order._id}`}
							className="block border border-line rounded-sm p-5 bg-surface hover:border-ink transition-colors"
						>
							<div className="flex gap-4">
								{/* Product thumbnails */}
								<div className="flex gap-2 shrink-0">
									{order.items.slice(0, MAX_THUMBS).map((item, i) => (
										<div
											key={i}
											className="w-12 h-16 sm:w-14 sm:h-18 bg-accent-soft overflow-hidden shrink-0"
										>
											<ProductImage
												src={item.image}
												alt={item.title}
												className="h-full w-full"
											/>
										</div>
									))}
									{order.items.length > MAX_THUMBS && (
										<div className="w-12 h-16 sm:w-14 sm:h-18 bg-ink text-canvas text-xs flex items-center justify-center shrink-0">
											+{order.items.length - MAX_THUMBS}
										</div>
									)}
								</div>

								<div className="flex-1 min-w-0">
									<p className="text-sm text-ink truncate">
										{order.items.map((i) => i.title).join(', ')}
									</p>
									<p className="text-xs text-muted mt-1">
										{order.orderNumber} ·{' '}
										{new Date(order.createdAt).toLocaleDateString('en-ZA', {
											day: 'numeric',
											month: 'long',
											year: 'numeric',
										})}
									</p>
									<div className="flex items-center gap-3 flex-wrap mt-3">
										{order.payment.paymentMethod === 'COD' && (
											<span className="text-[0.65rem] uppercase tracking-[0.15em] border border-line text-muted px-2.5 py-1">
												Cash on Delivery
											</span>
										)}
										<span
											className={`text-[0.65rem] uppercase tracking-[0.15em] border px-2.5 py-1 ${
												statusStyle[order.orderStatus] || 'text-ink border-line'
											}`}
										>
											{order.orderStatus}
										</span>
										<span className="text-ink ml-auto">
											{formatPrice(order.totalAmount)}
										</span>
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
