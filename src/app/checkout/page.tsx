'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import type { Address } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/format'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { ProductImage } from '@/components/shop/ProductImage'
import { CouponBox } from '@/components/cart/CouponBox'
import { redirectToPayFast } from '@/lib/payfast'

const emptyAddress = {
	name: '',
	phone: '',
	address: '',
	city: '',
	state: '',
	pincode: '',
	landmark: '',
}

interface CreateOrderData {
	orderId: string
	paymentMethod: 'payfast' | 'cod'
	payfastUrl?: string
	fields?: Record<string, string>
	amount: number
}

type PaymentMethod = 'payfast' | 'cod'

function CheckoutInner() {
	const { user, loading: authLoading, refresh: refreshUser } = useAuth()
	const { cart, loading: cartLoading, coupon } = useCart()
	const { error: toastError, success, toast } = useToast()
	const searchParams = useSearchParams()
	const router = useRouter()

	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [form, setForm] = useState(emptyAddress)
	const [savingAddr, setSavingAddr] = useState(false)
	const [paying, setPaying] = useState(false)
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payfast')

	// PayFast bounces the buyer back here (with ?cancelled=true) if they abandon payment.
	useEffect(() => {
		if (searchParams.get('cancelled') === 'true') {
			toast("Payment was cancelled — your cart is untouched, try again whenever you're ready.")
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Default to the user's default/first address
	useEffect(() => {
		if (user?.addresses?.length) {
			const def =
				user.addresses.find((a) => a.isDefault) || user.addresses[0]
			setSelectedId((prev) => prev ?? def._id)
		} else if (user) {
			setShowForm(true)
		}
	}, [user])

	if (authLoading || cartLoading) {
		return <div className="container-page py-24 text-center text-muted">Loading…</div>
	}

	if (!user) {
		return (
			<div className="container-page py-24 md:py-32 text-center">
				<h1 className="font-display text-4xl text-ink mb-4">Please sign in</h1>
				<ButtonLink href="/login?redirect=/checkout" size="lg">
					Sign In
				</ButtonLink>
			</div>
		)
	}

	if (cart.items.length === 0) {
		return (
			<div className="container-page py-24 md:py-32 text-center">
				<h1 className="font-display text-4xl text-ink mb-4">Your cart is empty</h1>
				<ButtonLink href="/shop" size="lg">
					Shop Fabrics
				</ButtonLink>
			</div>
		)
	}

	const addresses = user.addresses ?? []
	const selected = addresses.find((a) => a._id === selectedId)

	const saveAddress = async (e: React.FormEvent) => {
		e.preventDefault()
		setSavingAddr(true)
		try {
			const res = await api.post<{ addresses: Address[] }>(
				'/api/auth/profile/addresses',
				form
			)
			await refreshUser()
			const added = res.data?.addresses?.[res.data.addresses.length - 1]
			if (added?._id) setSelectedId(added._id)
			setForm(emptyAddress)
			setShowForm(false)
			success('Address added')
		} catch (err) {
			toastError(err instanceof Error ? err.message : 'Could not save address')
		} finally {
			setSavingAddr(false)
		}
	}

	const pay = async () => {
		if (!selected) {
			toastError('Please select or add a shipping address')
			return
		}
		setPaying(true)
		try {
			const shippingAddress = {
				name: selected.name,
				phone: selected.phone,
				address: selected.address,
				city: selected.city,
				state: selected.state,
				pincode: selected.pincode,
				landmark: selected.landmark,
			}

			const res = await api.post<CreateOrderData>('/api/orders/create', {
				shippingAddress,
				couponCode: coupon?.code,
				paymentMethod,
			})
			const data = res.data
			if (!data) throw new Error('Could not start the order')

			if (data.paymentMethod === 'cod') {
				// No gateway to redirect to — the order is confirmed immediately, so go
				// straight to the success page (it clears the cart/coupon once it sees
				// the order's payment status, which is already 'completed' for COD).
				router.push(`/checkout/success?order=${data.orderId}`)
				return
			}

			// Full-page redirect to PayFast's hosted payment page. Cart clearing and coupon
			// redemption happen once PayFast's ITN webhook confirms payment server-side —
			// see /checkout/success, which polls the order until that lands.
			redirectToPayFast(data.payfastUrl!, data.fields!)
		} catch (err) {
			toastError(err instanceof Error ? err.message : 'Checkout failed')
			setPaying(false)
		}
	}

	const itemCount = cart.items.reduce((n, i) => n + i.quantity, 0)
	const payTotal = coupon ? coupon.finalTotal : cart.totalPrice

	return (
		<div className="container-page py-10 md:py-20">
			<div className="mb-6 md:mb-10">
				<p className="eyebrow mb-2">Checkout</p>
				<h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink">
					Shipping &amp; Payment
				</h1>
				<p className="text-sm text-muted mt-3">
					{itemCount} {itemCount === 1 ? 'metre' : 'metres'} · cut to order and
					shipped free across South Africa.
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-6 lg:gap-10 items-start">
				{/* ---------- Shipping address ---------- */}
				<section className="border border-line bg-surface p-5 sm:p-6 md:p-7">
					<div className="flex items-baseline justify-between gap-3 mb-5">
						<h2 className="font-display text-xl sm:text-2xl text-ink">
							<span className="text-muted mr-2 font-sans text-base align-middle">
								1
							</span>
							Shipping address
						</h2>
						{addresses.length > 0 && !showForm && (
							<button
								onClick={() => setShowForm(true)}
								className="text-xs uppercase tracking-[0.15em] text-accent link-underline cursor-pointer"
							>
								+ New address
							</button>
						)}
					</div>

					{addresses.length > 0 && (
						<div className="space-y-3">
							{addresses.map((a) => {
								const active = a._id === selectedId && !showForm
								return (
									<button
										key={a._id}
										onClick={() => {
											setSelectedId(a._id)
											setShowForm(false)
										}}
										className={`w-full text-left p-4 border flex gap-3.5 transition-colors cursor-pointer ${
											active
												? 'border-ink bg-canvas'
												: 'border-line hover:border-ink-soft'
										}`}
									>
										<span
											className={`mt-0.5 w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
												active ? 'border-ink' : 'border-line'
											}`}
										>
											{active && (
												<span className="w-2 h-2 rounded-full bg-ink" />
											)}
										</span>
										<span className="min-w-0">
											<span className="block text-ink font-medium">{a.name}</span>
											<span className="block text-sm text-ink-soft mt-1 leading-relaxed">
												{a.address}
												{a.landmark ? `, ${a.landmark}` : ''}
												<br />
												{a.city}, {a.state} — {a.pincode}
												<br />
												{a.phone}
											</span>
										</span>
									</button>
								)
							})}
						</div>
					)}

					{!showForm && addresses.length === 0 && (
						<button
							onClick={() => setShowForm(true)}
							className="w-full border border-dashed border-line hover:border-ink-soft text-sm text-ink-soft hover:text-ink py-6 transition-colors cursor-pointer"
						>
							+ Add a shipping address
						</button>
					)}

					{showForm && (
						<form
							onSubmit={saveAddress}
							className={`border border-line bg-canvas p-5 md:p-6 space-y-4 ${
								addresses.length > 0 ? 'mt-3' : ''
							}`}
						>
							<p className="eyebrow">New address</p>
							<div className="grid sm:grid-cols-2 gap-4">
								<Field label="Full Name">
									<Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
								</Field>
								<Field label="Phone">
									<Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 0821234567" />
								</Field>
							</div>
							<Field label="Address">
								<Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
							</Field>
							<div className="grid sm:grid-cols-3 gap-4">
								<Field label="City">
									<Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Cape Town" />
								</Field>
								<Field label="Province">
									<Input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. Western Cape" />
								</Field>
								<Field label="Postal Code">
									<Input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="e.g. 8001" />
								</Field>
							</div>
							<Field label="Landmark (optional)">
								<Input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
							</Field>
							<div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
								<Button
									type="submit"
									loading={savingAddr}
									className="w-full sm:w-auto"
								>
									Save Address
								</Button>
								{addresses.length > 0 && (
									<Button
										type="button"
										variant="ghost"
										onClick={() => setShowForm(false)}
										className="w-full sm:w-auto"
									>
										Cancel
									</Button>
								)}
							</div>
						</form>
					)}

					<div className="border-t border-line mt-6 pt-5 flex gap-3 text-sm text-ink-soft">
						<svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5">
							<path d="M3 7h11v8H3z" strokeLinejoin="round" />
							<path d="M14 10h4l3 3v2h-7z" strokeLinejoin="round" />
							<circle cx="7" cy="17" r="2" />
							<circle cx="17" cy="17" r="2" />
						</svg>
						<p className="leading-relaxed">
							<span className="text-ink">Free nationwide delivery.</span> Fabric is
							cut to order and dispatched within 2–4 working days, with tracking by
							email.
						</p>
					</div>
				</section>

				{/* ---------- Review & pay ---------- */}
				<aside className="lg:sticky lg:top-28 border border-line bg-surface p-5 sm:p-6 md:p-7">
					<h2 className="font-display text-xl sm:text-2xl text-ink mb-5">
						<span className="text-muted mr-2 font-sans text-base align-middle">
							2
						</span>
						Review &amp; pay
					</h2>
					<div className="divide-y divide-line border-y border-line mb-5">
						{cart.items.map((item) => (
							<div key={(item.productId as string) + (item.variantId || '')} className="flex gap-3 py-3">
								<div className="w-12 h-16 bg-accent-soft overflow-hidden shrink-0">
									<ProductImage src={item.image} alt={item.title} className="h-full w-full" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm text-ink truncate">{item.title}</p>
									<p className="text-xs text-muted mt-0.5">{item.quantity} m × {formatPrice(item.price)}</p>
								</div>
								<p className="text-sm text-ink whitespace-nowrap">
									{formatPrice(item.price * item.quantity)}
								</p>
							</div>
						))}
					</div>

					<div className="mb-5">
						<CouponBox />
					</div>

					<div className="mb-5">
						<p className="text-xs uppercase tracking-[0.15em] text-ink-soft mb-3">
							Payment Method
						</p>
						<div className="space-y-2">
							<PaymentOption
								active={paymentMethod === 'payfast'}
								onSelect={() => setPaymentMethod('payfast')}
								title="Pay Online"
								description="Card, Instant EFT & more via PayFast"
								icon={
									<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
										<rect x="3" y="6" width="18" height="13" rx="1.5" />
										<path d="M3 10h18" />
									</svg>
								}
							/>
							<PaymentOption
								active={paymentMethod === 'cod'}
								onSelect={() => setPaymentMethod('cod')}
								title="Cash on Delivery"
								description="Pay in cash when your order arrives"
								icon={
									<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
										<circle cx="12" cy="12" r="8.5" />
										<path d="M12 8v8M9.5 10a2.5 2.5 0 0 1 2.5-1.2c1.4 0 2.5.8 2.5 1.9 0 2.6-5 1.4-5 4 0 1.1 1.1 1.9 2.5 1.9a2.7 2.7 0 0 0 2.5-1.2" />
									</svg>
								}
							/>
						</div>
					</div>

					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-ink-soft">Subtotal</span>
							<span className="text-ink">{formatPrice(cart.totalPrice)}</span>
						</div>
						{coupon && (
							<div className="flex justify-between">
								<span className="text-ink-soft">Coupon ({coupon.code})</span>
								<span className="text-accent">− {formatPrice(coupon.discount)}</span>
							</div>
						)}
						<div className="flex justify-between">
							<span className="text-ink-soft">Shipping</span>
							<span className="text-success">Free</span>
						</div>
					</div>
					<div className="flex items-baseline justify-between border-t border-line mt-4 pt-4">
						<span className="text-ink">Total</span>
						<span className="font-display text-2xl text-ink">
							{formatPrice(payTotal)}
						</span>
					</div>

					{!selected && (
						<p className="text-[0.7rem] text-muted mt-4 text-center">
							Select a shipping address to continue.
						</p>
					)}
					<Button
						onClick={pay}
						loading={paying}
						disabled={!selected}
						size="lg"
						className="w-full mt-4"
					>
						{paying
							? paymentMethod === 'cod'
								? 'Placing Order…'
								: 'Redirecting…'
							: paymentMethod === 'cod'
								? `Place Order — Pay ${formatPrice(payTotal)} on Delivery`
								: `Pay ${formatPrice(payTotal)}`}
					</Button>
					<p className="flex items-center justify-center gap-1.5 text-[0.7rem] text-muted mt-3 leading-relaxed">
						{paymentMethod === 'cod' ? (
							<>
								<svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
									<path d="M4 7h11v8H4z" strokeLinejoin="round" />
									<path d="M15 10h4l3 3v2h-7z" strokeLinejoin="round" />
									<circle cx="8" cy="17" r="2" />
									<circle cx="18" cy="17" r="2" />
								</svg>
								Have the exact amount ready for our courier on delivery.
							</>
						) : (
							<>
								<svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
									<rect x="5" y="11" width="14" height="9" rx="1" />
									<path d="M8 11V8a4 4 0 0 1 8 0v3" />
								</svg>
								Secure payment via PayFast — card, EFT &amp; more.
							</>
						)}
					</p>
					<Link
						href="/cart"
						className="block text-center mt-3 text-xs uppercase tracking-[0.15em] text-muted link-underline"
					>
						Back to Cart
					</Link>
				</aside>
			</div>
		</div>
	)
}

function PaymentOption({
	active,
	onSelect,
	title,
	description,
	icon,
}: {
	active: boolean
	onSelect: () => void
	title: string
	description: string
	icon: React.ReactNode
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={`w-full text-left p-3.5 border flex items-center gap-3 transition-colors cursor-pointer ${
				active ? 'border-ink bg-canvas' : 'border-line hover:border-ink-soft'
			}`}
		>
			<span
				className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
					active ? 'border-ink' : 'border-line'
				}`}
			>
				{active && <span className="w-2 h-2 rounded-full bg-ink" />}
			</span>
			<span className="text-muted shrink-0">{icon}</span>
			<span className="min-w-0">
				<span className="block text-sm text-ink">{title}</span>
				<span className="block text-xs text-muted mt-0.5">{description}</span>
			</span>
		</button>
	)
}

export default function CheckoutPage() {
	return (
		<Suspense fallback={<div className="container-page py-24 text-center text-muted">Loading…</div>}>
			<CheckoutInner />
		</Suspense>
	)
}
