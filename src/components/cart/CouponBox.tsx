'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/Button'

export function CouponBox() {
	const { coupon, applyCoupon, removeCoupon } = useCart()
	const [code, setCode] = useState('')
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const apply = async () => {
		if (!code.trim() || busy) return
		setBusy(true)
		setError(null)
		try {
			await applyCoupon(code.trim())
			setCode('')
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Could not apply coupon')
		} finally {
			setBusy(false)
		}
	}

	if (coupon) {
		return (
			<div className="flex items-center justify-between gap-3 border border-line bg-canvas px-4 py-3 text-sm">
				<div>
					<p className="text-ink">
						<span className="uppercase tracking-[0.1em] text-xs text-accent">
							{coupon.code}
						</span>{' '}
						applied
					</p>
					<p className="text-xs text-muted mt-0.5">
						You saved {formatPrice(coupon.discount)}
					</p>
				</div>
				<button
					onClick={removeCoupon}
					className="text-xs uppercase tracking-[0.15em] text-muted hover:text-danger link-underline cursor-pointer whitespace-nowrap"
				>
					Remove
				</button>
			</div>
		)
	}

	return (
		<div>
			<div className="flex gap-2">
				<input
					type="text"
					value={code}
					onChange={(e) => {
						setCode(e.target.value)
						if (error) setError(null)
					}}
					onKeyDown={(e) => e.key === 'Enter' && apply()}
					placeholder="Coupon code"
					className="flex-1 h-11 px-4 bg-transparent border border-line text-sm text-ink uppercase placeholder:normal-case placeholder:text-muted focus:outline-none focus:border-ink transition-colors"
				/>
				<Button variant="outline" size="md" onClick={apply} loading={busy}>
					Apply
				</Button>
			</div>
			{error && <p className="text-xs text-danger mt-2">{error}</p>}
		</div>
	)
}
