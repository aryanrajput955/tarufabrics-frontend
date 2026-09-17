'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import type { Order } from '@/lib/types'
import { formatPrice } from '@/lib/format'
import { useCart } from '@/context/CartContext'
import { ButtonLink } from '@/components/ui/Button'
import { ProductImage } from '@/components/shop/ProductImage'

const POLL_INTERVAL_MS = 2000
const MAX_POLLS = 20 // ~40s — PayFast's ITN usually lands within a few seconds

function SuccessInner() {
	const params = useSearchParams()
	const orderId = params.get('order')
	const { refresh: refreshCart, removeCoupon } = useCart()

	const [order, setOrder] = useState<Order | null>(null)
	const [loading, setLoading] = useState(true)
	const [pollsLeft, setPollsLeft] = useState(MAX_POLLS)
	const settledRef = useRef(false)

	useEffect(() => {
		if (!orderId) {
			setLoading(false)
			return
		}

		let cancelled = false

		const poll = async () => {
			try {
				const res = await api.get<Order>(`/api/orders/${orderId}`)
				if (cancelled) return
				const fetched = res.data ?? null
				setOrder(fetched)

				// PayFast's ITN webhook confirms payment server-side, asynchronously — once it
				// lands (status flips away from 'pending'), clear the cart/coupon client-side.
				if (fetched?.payment.status === 'completed' && !settledRef.current) {
					settledRef.current = true
					await refreshCart()
					removeCoupon()
				}
			} catch {
				if (!cancelled) setOrder(null)
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		poll()
		const interval = setInterval(() => {
			setPollsLeft((n) => {
				if (n <= 1) {
					clearInterval(interval)
					return 0
				}
				return n - 1
			})
			if (!settledRef.current) poll()
		}, POLL_INTERVAL_MS)

		return () => {
			cancelled = true
			clearInterval(interval)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderId])

	const status = order?.payment.status
	const stillWaiting = status === 'pending' && pollsLeft > 0
	const confirmationTimedOut = status === 'pending' && pollsLeft <= 0

	return (
		<div className="container-page py-16 md:py-24 max-w-2xl mx-auto">
			<div className="text-center">
				{status === 'failed' ? (
					<>
						<span className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-danger text-danger mb-6">
							<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
								<path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</span>
						<p className="eyebrow mb-3">Payment Not Completed</p>
						<h1 className="font-display text-4xl md:text-5xl text-ink">
							We couldn&apos;t confirm your payment
						</h1>
						<p className="mt-4 text-ink-soft leading-relaxed">
							PayFast reported this payment as unsuccessful. You haven&apos;t been
							charged, and your cart is still intact.
						</p>
					</>
				) : confirmationTimedOut ? (
					<>
						<span className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-line text-ink-soft mb-6">
							<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
								<path d="M12 7v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
								<circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</span>
						<p className="eyebrow mb-3">Still Confirming</p>
						<h1 className="font-display text-4xl md:text-5xl text-ink">
							This is taking longer than usual
						</h1>
						<p className="mt-4 text-ink-soft leading-relaxed">
							We haven&apos;t heard back from PayFast yet. Your order is saved and
							we&apos;ll update it automatically once payment is confirmed — check My
							Orders shortly, or contact us if this persists.
						</p>
					</>
				) : (
					<>
						<span className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-success text-success mb-6">
							<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
								<path d="M4 12.5 9.5 18 20 6.5" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</span>
						<p className="eyebrow mb-3">
							{stillWaiting ? 'Confirming Payment' : 'Order Confirmed'}
						</p>
						<h1 className="font-display text-4xl md:text-5xl text-ink">
							{stillWaiting ? 'Almost there…' : 'Thank you for your order'}
						</h1>
						<p className="mt-4 text-ink-soft leading-relaxed">
							{stillWaiting
								? "We're waiting on PayFast to confirm your payment — this usually takes just a few seconds."
								: order?.payment.paymentMethod === 'COD'
									? "We've received your order and begun preparing your fabric. Have the exact amount ready for our courier when it arrives."
									: "We've received your order and begun preparing your fabric. A confirmation has been noted to your account."}
						</p>
					</>
				)}
			</div>

			{loading ? (
				<p className="text-center text-muted mt-12">Loading your order…</p>
			) : order ? (
				<div className="mt-12 border border-line bg-surface">
					<div className="flex items-center justify-between p-5 border-b border-line">
						<div>
							<p className="text-xs uppercase tracking-[0.15em] text-muted">
								Order ID
							</p>
							<p className="text-ink mt-1">{order.orderNumber}</p>
						</div>
						<div className="text-right">
							<p className="text-xs uppercase tracking-[0.15em] text-muted">Total</p>
							<p className="font-display text-xl text-ink mt-1">
								{formatPrice(order.totalAmount)}
							</p>
						</div>
					</div>

					<div className="divide-y divide-line">
						{order.items.map((item, i) => (
							<div key={i} className="flex gap-4 p-5">
								<div className="w-14 h-18 bg-accent-soft overflow-hidden shrink-0">
									<ProductImage src={item.image} alt={item.title} className="h-full w-full" />
								</div>
								<div className="flex-1">
									<p className="text-ink">{item.title}</p>
									<p className="text-sm text-muted mt-1">{item.quantity} m</p>
								</div>
								<p className="text-ink whitespace-nowrap">
									{formatPrice(item.price * item.quantity)}
								</p>
							</div>
						))}
					</div>

					<div className="p-5 border-t border-line text-sm text-ink-soft">
						<p className="text-xs uppercase tracking-[0.15em] text-muted mb-2">
							Shipping to
						</p>
						{order.shippingAddress.name}, {order.shippingAddress.address},{' '}
						{order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
						{order.shippingAddress.pincode}
					</div>
				</div>
			) : (
				<p className="text-center text-muted mt-12">
					Your order was placed successfully.
				</p>
			)}

			<div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
				{status === 'failed' ? (
					<ButtonLink href="/checkout" size="lg">
						Try Again
					</ButtonLink>
				) : (
					order && (
						<ButtonLink href={`/account/orders/${order._id}`} size="lg">
							View Order
						</ButtonLink>
					)
				)}
				<ButtonLink href="/shop" variant="outline" size="lg">
					Continue Shopping
				</ButtonLink>
			</div>
		</div>
	)
}

export default function OrderSuccessPage() {
	return (
		<Suspense fallback={<div className="container-page py-24" />}>
			<SuccessInner />
		</Suspense>
	)
}
