'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/format'
import { ButtonLink } from '@/components/ui/Button'
import { ProductImage } from '@/components/shop/ProductImage'
import type { CartItem } from '@/lib/types'

export function CartDrawer() {
	const { cart, drawerOpen, closeDrawer, updateItem, removeItem } = useCart()
	const pathname = usePathname()

	// Close on route change
	useEffect(() => {
		closeDrawer()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname])

	// Lock body scroll while open
	useEffect(() => {
		if (!drawerOpen) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [drawerOpen])

	// Close on Escape
	useEffect(() => {
		if (!drawerOpen) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeDrawer()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [drawerOpen, closeDrawer])

	return (
		<>
			{/* Backdrop */}
			<div
				onClick={closeDrawer}
				className={`fixed inset-0 z-[60] bg-ink/50 transition-opacity duration-300 ${
					drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
				}`}
				aria-hidden="true"
			/>

			{/* Panel */}
			<div
				role="dialog"
				aria-modal="true"
				aria-label="Shopping cart"
				className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-canvas shadow-xl flex flex-col transition-transform duration-300 ease-out ${
					drawerOpen ? 'translate-x-0' : 'translate-x-full'
				}`}
			>
				<div className="flex items-center justify-between h-16 md:h-20 px-6 border-b border-line shrink-0">
					<h2 className="font-display text-xl text-ink">
						Your Cart
						{cart.totalItems > 0 && (
							<span className="text-muted text-sm ml-2">({cart.totalItems} m)</span>
						)}
					</h2>
					<button
						onClick={closeDrawer}
						aria-label="Close cart"
						className="text-2xl leading-none text-ink-soft hover:text-ink cursor-pointer w-8 h-8 flex items-center justify-center"
					>
						×
					</button>
				</div>

				{cart.items.length === 0 ? (
					<div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
						<p className="text-ink-soft mb-6">Your cart is empty.</p>
						<ButtonLink href="/shop" onClick={closeDrawer}>
							Shop Fabrics
						</ButtonLink>
					</div>
				) : (
					<>
						<div className="flex-1 overflow-y-auto divide-y divide-line px-6">
							{cart.items.map((item) => (
								<DrawerRow
									key={(item.productId as string) + (item.variantId || '')}
									item={item}
									onUpdate={updateItem}
									onRemove={removeItem}
									onNavigate={closeDrawer}
								/>
							))}
						</div>

						<div className="border-t border-line px-6 py-5 shrink-0">
							<div className="flex items-baseline justify-between mb-4">
								<span className="text-sm text-ink-soft">Subtotal</span>
								<span className="font-display text-xl text-ink">
									{formatPrice(cart.totalPrice)}
								</span>
							</div>
							<p className="text-xs text-muted mb-4">
								Shipping and any discounts calculated at checkout.
							</p>
							<ButtonLink
								href="/checkout"
								size="lg"
								className="w-full"
								onClick={closeDrawer}
							>
								Checkout
							</ButtonLink>
							<Link
								href="/cart"
								onClick={closeDrawer}
								className="block text-center mt-3 text-xs uppercase tracking-[0.15em] text-muted link-underline"
							>
								View Full Cart
							</Link>
						</div>
					</>
				)}
			</div>
		</>
	)
}

function DrawerRow({
	item,
	onUpdate,
	onRemove,
	onNavigate,
}: {
	item: CartItem
	onUpdate: (productId: string, quantity: number) => Promise<void>
	onRemove: (productId: string) => Promise<void>
	onNavigate: () => void
}) {
	const { error: toastError } = useToast()
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
		<div className={`flex gap-4 py-5 ${busy ? 'opacity-60' : ''}`}>
			<Link
				href={`/product/${productId}`}
				onClick={onNavigate}
				className="w-16 h-20 bg-accent-soft overflow-hidden shrink-0"
			>
				<ProductImage src={item.image} alt={item.title} className="h-full w-full" />
			</Link>

			<div className="flex-1 min-w-0">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h3 className="text-sm text-ink leading-snug truncate">{item.title}</h3>
						{item.variantLabel && (
							<p className="text-[0.65rem] text-muted mt-0.5 uppercase tracking-[0.1em]">
								{item.variantLabel}
							</p>
						)}
					</div>
					<p className="text-sm text-ink whitespace-nowrap">
						{formatPrice(item.price * item.quantity)}
					</p>
				</div>

				<div className="mt-3 flex items-center justify-between">
					<div className="flex items-center border border-line h-8">
						<button
							onClick={() => change(item.quantity - 1)}
							disabled={busy || item.quantity <= 1}
							className="w-8 h-full text-sm text-ink hover:text-accent disabled:opacity-30 cursor-pointer"
							aria-label="Decrease"
						>
							−
						</button>
						<span className="w-9 text-center text-xs tabular-nums">
							{item.quantity} m
						</span>
						<button
							onClick={() => change(item.quantity + 1)}
							disabled={busy || item.quantity >= item.stock}
							className="w-8 h-full text-sm text-ink hover:text-accent disabled:opacity-30 cursor-pointer"
							aria-label="Increase"
						>
							+
						</button>
					</div>
					<button
						onClick={remove}
						disabled={busy}
						className="text-[0.65rem] uppercase tracking-[0.12em] text-muted hover:text-danger link-underline cursor-pointer"
					>
						Remove
					</button>
				</div>
			</div>
		</div>
	)
}
