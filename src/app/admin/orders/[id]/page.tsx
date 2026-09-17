'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/admin/Badge'
import { ProductImage } from '@/components/shop/ProductImage'
import type { Order } from '@/lib/types'

const STATUSES: Order['orderStatus'][] = ['processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrderDetailPage() {
	const { id } = useParams<{ id: string }>()
	const router = useRouter()
	const { error: toastError, success } = useToast()
	const [order, setOrder] = useState<Order | null>(null)
	const [loading, setLoading] = useState(true)
	const [updating, setUpdating] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [markingCollected, setMarkingCollected] = useState(false)

	const load = async () => {
		setLoading(true)
		try {
			const res = await api.get<Order>(`/api/admin/orders/${id}`)
			setOrder(res.data ?? null)
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not load order')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id])

	const updateStatus = async (status: string) => {
		setUpdating(true)
		try {
			await api.patch(`/api/admin/orders/${id}/status`, { orderStatus: status })
			await load()
			success(`Order marked as "${status}"`)
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not update status')
		} finally {
			setUpdating(false)
		}
	}

	const markCollected = async () => {
		setMarkingCollected(true)
		try {
			await api.patch(`/api/admin/orders/${id}/collect-cod`, {})
			await load()
			success('Marked as collected')
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not update order')
		} finally {
			setMarkingCollected(false)
		}
	}

	const remove = async () => {
		if (!order) return
		if (!window.confirm(`Delete order ${order.orderNumber}? This cannot be undone.`)) return
		setDeleting(true)
		try {
			await api.del(`/api/admin/orders/${id}`)
			success('Order deleted')
			router.push('/admin/orders')
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not delete order')
			setDeleting(false)
		}
	}

	if (loading) {
		return <p className="text-muted text-sm">Loading…</p>
	}

	if (!order) {
		return <p className="text-danger text-sm">Order not found.</p>
	}

	const customer = typeof order.userId === 'object' ? order.userId : null

	return (
		<div className="max-w-3xl">
			<div className="mb-8">
				<Link
					href="/admin/orders"
					className="text-xs uppercase tracking-[0.15em] text-muted link-underline"
				>
					← Back to Orders
				</Link>
				<div className="flex items-center justify-between mt-3">
					<div>
						<p className="eyebrow mb-1">Order ID</p>
						<h1 className="font-display text-3xl text-ink">{order.orderNumber}</h1>
					</div>
					<Badge status={order.orderStatus} />
				</div>
			</div>

			<div className="grid sm:grid-cols-2 gap-6 mb-8">
				<div className="border border-line bg-surface p-5">
					<p className="text-xs uppercase tracking-[0.1em] text-muted mb-2">Customer</p>
					<p className="text-ink">{customer?.name || '—'}</p>
					<p className="text-sm text-ink-soft">{customer?.email}</p>
				</div>
				<div className="border border-line bg-surface p-5">
					<p className="text-xs uppercase tracking-[0.1em] text-muted mb-2">Shipping Address</p>
					<p className="text-sm text-ink-soft leading-relaxed">
						{order.shippingAddress.name}
						<br />
						{order.shippingAddress.address}
						{order.shippingAddress.landmark ? `, ${order.shippingAddress.landmark}` : ''}
						<br />
						{order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
						{order.shippingAddress.pincode}
						<br />
						{order.shippingAddress.phone}
					</p>
				</div>
			</div>

			<div className="border border-line bg-surface p-5 mb-8">
				<p className="text-xs uppercase tracking-[0.1em] text-muted mb-1">Update Status</p>
				<p className="text-xs text-muted mb-3">
					Click the stage this order has reached. The customer sees this on their Order
					History page — this doesn&apos;t send an email.
				</p>
				<div className="flex flex-wrap gap-2">
					{STATUSES.map((s) => (
						<button
							key={s}
							onClick={() => updateStatus(s)}
							disabled={updating || order.orderStatus === s}
							className={`px-3.5 py-2 text-xs uppercase tracking-[0.1em] border rounded-sm transition-colors cursor-pointer disabled:cursor-default ${
								order.orderStatus === s
									? 'bg-ink text-canvas border-ink'
									: 'border-line text-ink-soft hover:border-ink disabled:opacity-40'
							}`}
						>
							{s}
						</button>
					))}
				</div>
			</div>

			<div className="border border-line bg-surface divide-y divide-line mb-8">
				{order.items.map((item, i) => (
					<div key={i} className="flex gap-4 p-4">
						<div className="w-14 h-18 shrink-0 bg-accent-soft overflow-hidden">
							<ProductImage src={item.image} alt={item.title} className="h-full w-full" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-ink">{item.title}</p>
							<p className="text-xs text-muted mt-0.5">
								{item.quantity} m × {formatPrice(item.price)}
							</p>
						</div>
						<p className="text-ink whitespace-nowrap">
							{formatPrice(item.price * item.quantity)}
						</p>
					</div>
				))}
			</div>

			<div className="flex items-center justify-between border-t border-line pt-5 mb-8">
				<div className="text-sm text-ink-soft">
					{order.coupon?.code && (
						<p>
							Coupon <span className="text-ink">{order.coupon.code}</span> — saved{' '}
							{formatPrice(order.coupon.discountAmount)}
						</p>
					)}
					{order.payment.paymentMethod === 'COD' ? (
						<p>
							Payment: Cash on Delivery —{' '}
							<span className={order.payment.codCollected ? 'text-success' : 'text-accent-dark'}>
								{order.payment.codCollected ? 'collected' : 'due on delivery'}
							</span>
						</p>
					) : (
						<p>Payment: {order.payment.status} via {order.payment.paymentMethod || 'PayFast'}</p>
					)}
				</div>
				<div className="text-right">
					<p className="text-xs uppercase tracking-[0.1em] text-muted">Total</p>
					<p className="font-display text-2xl text-ink">{formatPrice(order.totalAmount)}</p>
				</div>
			</div>

			{order.payment.paymentMethod === 'COD' && !order.payment.codCollected && (
				<div className="border border-line bg-surface p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
					<div>
						<p className="text-sm text-ink">Collect {formatPrice(order.totalAmount)} in cash on delivery</p>
						<p className="text-xs text-muted mt-1">
							Mark it once the courier confirms the cash has been handed over.
						</p>
					</div>
					<Button onClick={markCollected} loading={markingCollected} size="sm">
						Mark Cash Collected
					</Button>
				</div>
			)}

			<Button variant="ghost" onClick={remove} loading={deleting} className="text-danger">
				Delete Order
			</Button>
		</div>
	)
}
