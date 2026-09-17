'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Order } from '@/lib/types'
import { formatPrice } from '@/lib/format'
import { ProductImage } from '@/components/shop/ProductImage'

export default function OrderDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = use(params)
	const [order, setOrder] = useState<Order | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		api
			.get<Order>(`/api/orders/${id}`)
			.then((res) => setOrder(res.data ?? null))
			.catch((e) => setError(e.message))
			.finally(() => setLoading(false))
	}, [id])

	if (loading) return <p className="text-muted">Loading order…</p>
	if (error || !order)
		return (
			<div>
				<p className="text-danger mb-4">{error || 'Order not found'}</p>
				<Link href="/account/orders" className="text-accent link-underline text-sm">
					Back to orders
				</Link>
			</div>
		)

	const addr = order.shippingAddress

	return (
		<div>
			<Link
				href="/account/orders"
				className="text-xs uppercase tracking-[0.15em] text-muted link-underline"
			>
				← All Orders
			</Link>
			<p className="eyebrow mt-4 mb-1">Order ID</p>
			<h1 className="font-display text-3xl text-ink mb-1">
				{order.orderNumber}
			</h1>
			<p className="text-sm text-muted mb-8">
				Placed{' '}
				{new Date(order.createdAt).toLocaleDateString('en-ZA', {
					day: 'numeric',
					month: 'long',
					year: 'numeric',
				})}{' '}
				· Status: <span className="text-ink capitalize">{order.orderStatus}</span>
			</p>

			{/* Items */}
			<div className="border border-line rounded-sm divide-y divide-line bg-surface">
				{order.items.map((item, i) => (
					<div key={i} className="flex gap-4 p-4">
						<div className="w-16 h-20 bg-accent-soft overflow-hidden shrink-0">
							<ProductImage src={item.image} alt={item.title} className="h-full w-full" />
						</div>
						<div className="flex-1">
							<p className="text-ink">{item.title}</p>
							<p className="text-sm text-muted mt-1">Qty: {item.quantity}</p>
						</div>
						<p className="text-ink">{formatPrice(item.price * item.quantity)}</p>
					</div>
				))}
			</div>

			{/* Summary + address */}
			<div className="grid sm:grid-cols-2 gap-4 mt-6">
				<div className="border border-line rounded-sm p-5 bg-surface">
					<p className="eyebrow mb-3">Shipping Address</p>
					<p className="text-ink text-sm">{addr.name}</p>
					<p className="text-ink-soft text-sm mt-1 leading-relaxed">
						{addr.address}
						{addr.landmark ? `, ${addr.landmark}` : ''}
						<br />
						{addr.city}, {addr.state} — {addr.pincode}
						<br />
						{addr.phone}
					</p>
				</div>
				<div className="border border-line rounded-sm p-5 bg-surface">
					<p className="eyebrow mb-3">Payment</p>
					<div className="flex justify-between text-sm text-ink-soft">
						<span>Method</span>
						<span className="text-ink">
							{order.payment.paymentMethod === 'COD' ? 'Cash on Delivery' : 'PayFast'}
						</span>
					</div>
					<div className="flex justify-between text-sm text-ink-soft mt-2">
						<span>Status</span>
						<span className="capitalize text-ink">
							{order.payment.paymentMethod === 'COD'
								? order.payment.codCollected
									? 'Collected'
									: 'Due on delivery'
								: order.payment.status}
						</span>
					</div>
					<div className="flex justify-between mt-4 pt-4 border-t border-line">
						<span className="text-ink">Total</span>
						<span className="text-ink text-lg">
							{formatPrice(order.totalAmount)}
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}
