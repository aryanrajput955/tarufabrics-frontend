'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/format'
import { ButtonLink } from '@/components/ui/Button'
import { ProductImage } from '@/components/shop/ProductImage'
import { CouponBox } from '@/components/cart/CouponBox'
import type { CartItem } from '@/lib/types'

export default function CartPage() {
	const { user, loading: authLoading } = useAuth()
	const { cart, loading, updateItem, removeItem, coupon } = useCart()

	if (authLoading) {
		return <div className="container-page py-24 text-center text-muted">Loading…</div>
	}

	if (!user) {
		return (
			<div className="container-page py-24 md:py-32 text-center">
				<p className="eyebrow mb-3">Your Cart</p>
				<h1 className="font-display text-4xl text-ink mb-4">Please sign in</h1>
				<p className="text-muted mb-8 max-w-sm mx-auto">
					Sign in to view your cart and check out.
				</p>
				<ButtonLink href="/login?redirect=/cart" size="lg">
					Sign In
				</ButtonLink>
			</div>
		)
	}

	if (!loading && cart.items.length === 0) {
		return (
			<div className="container-page py-24 md:py-32 text-center">
				<p className="eyebrow mb-3">Your Cart</p>
				<h1 className="font-display text-4xl text-ink mb-4">Your cart is empty</h1>
				<p className="text-muted mb-8 max-w-sm mx-auto">
					Explore the collection and add fabrics by the metre.
				</p>
				<ButtonLink href="/shop" size="lg">
					Shop Fabrics
				</ButtonLink>
			</div>
		)
	}

	return (
		<div className="container-page py-10 md:py-20">
			<div className="mb-6 md:mb-10">
				<p className="eyebrow mb-2">Your Cart</p>
				<h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink">
					Shopping Cart
				</h1>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 lg:gap-16 items-start">
				{/* Items */}
				<div className="divide-y divide-line border-y border-line">
					{cart.items.map((item) => (
						<CartRow
							key={(item.productId as string) + (item.variantId || '')}
							item={item}
							onUpdate={updateItem}
							onRemove={removeItem}
						/>
					))}
				</div>

				{/* Summary */}
				<aside className="lg:sticky lg:top-28 border border-line bg-surface p-6 md:p-7">
					<h2 className="font-display text-2xl text-ink mb-5">Order Summary</h2>
					<div className="mb-5">
						<CouponBox />
					</div>
					<div className="space-y-3 text-sm">
						<Row label={`Subtotal (${cart.totalItems} m)`} value={formatPrice(cart.totalPrice)} />
						{coupon && (
							<Row
								label={`Coupon (${coupon.code})`}
								value={`− ${formatPrice(coupon.discount)}`}
								accent
							/>
						)}
						<Row label="Shipping" value="Calculated at checkout" muted />
					</div>
					<div className="flex items-baseline justify-between border-t border-line mt-5 pt-5">
						<span className="text-ink">Total</span>
						<span className="font-display text-2xl text-ink">
							{formatPrice(coupon ? coupon.finalTotal : cart.totalPrice)}
						</span>
					</div>
					<ButtonLink href="/checkout" size="lg" className="w-full mt-6">
						Proceed to Checkout
					</ButtonLink>
					<Link
						href="/shop"
						className="block text-center mt-4 text-xs uppercase tracking-[0.15em] text-muted link-underline"
					>
						Continue Shopping
					</Link>
				</aside>
			</div>
		</div>
	)
}

function Row({
	label,
	value,
	muted,
	accent,
}: {
	label: string
	value: string
	muted?: boolean
	accent?: boolean
}) {
	return (
		<div className="flex items-baseline justify-between">
			<span className="text-ink-soft">{label}</span>
			<span
				className={
					accent ? 'text-accent' : muted ? 'text-muted text-xs' : 'text-ink'
				}
			>
				{value}
			</span>
		</div>
	)
}

function CartRow({
	item,
	onUpdate,
	onRemove,
}: {
	item: CartItem
	onUpdate: (productId: string, quantity: number) => Promise<void>
	onRemove: (productId: string) => Promise<void>
}) {
	const { error: toastError } = useToast()
	const router = useRouter()
	const [busy, setBusy] = useState(false)
	const productId = item.productId as string

	const change = async (next: number) => {
		if (next < 1 || next > item.stock || busy) return
		setBusy(true)
		try {
			await onUpdate(productId, next)
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not update quantity')
		} finally {
			setBusy(false)
		}
	}

	const remove = async () => {
		setBusy(true)
		try {
			await onRemove(productId)
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not remove item')
			setBusy(false)
		}
	}

	return (
		<div className={`flex gap-4 md:gap-6 py-6 ${busy ? 'opacity-60' : ''}`}>
			<button
				onClick={() => router.push(`/product/${productId}`)}
				className="w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 bg-accent-soft overflow-hidden shrink-0 cursor-pointer"
			>
				<ProductImage src={item.image} alt={item.title} className="h-full w-full" />
			</button>

			<div className="flex-1 min-w-0 flex flex-col">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h3 className="font-display text-lg sm:text-xl text-ink leading-snug break-words">
							{item.title}
						</h3>
						{item.variantLabel && (
							<p className="text-xs text-muted mt-1 uppercase tracking-[0.12em]">
								{item.variantLabel}
							</p>
						)}
						<p className="text-sm text-ink-soft mt-1">
							{formatPrice(item.price)} <span className="text-muted">/ metre</span>
						</p>
					</div>
					<p className="font-display text-xl text-ink whitespace-nowrap">
						{formatPrice(item.price * item.quantity)}
					</p>
				</div>

				<div className="mt-auto flex items-center justify-between pt-4">
					{/* Metre stepper */}
					<div className="flex items-center border border-line h-10">
						<button
							onClick={() => change(item.quantity - 1)}
							disabled={busy || item.quantity <= 1}
							className="w-10 h-full text-lg text-ink hover:text-accent disabled:opacity-30 cursor-pointer"
							aria-label="Decrease"
						>
							−
						</button>
						<span className="w-12 text-center text-sm tabular-nums">
							{item.quantity} m
						</span>
						<button
							onClick={() => change(item.quantity + 1)}
							disabled={busy || item.quantity >= item.stock}
							className="w-10 h-full text-lg text-ink hover:text-accent disabled:opacity-30 cursor-pointer"
							aria-label="Increase"
						>
							+
						</button>
					</div>

					<button
						onClick={remove}
						disabled={busy}
						className="text-xs uppercase tracking-[0.15em] text-muted hover:text-danger link-underline cursor-pointer"
					>
						Remove
					</button>
				</div>
			</div>
		</div>
	)
}
