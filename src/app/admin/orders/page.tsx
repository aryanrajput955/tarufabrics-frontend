'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/admin/Badge'
import { AdminPageHeader } from '@/components/admin/PageHeader'
import type { Order } from '@/lib/types'

type Tab = 'open' | 'delivered'

export default function AdminOrdersPage() {
	const { error: toastError } = useToast()
	const [tab, setTab] = useState<Tab>('open')
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false
		async function load() {
			setLoading(true)
			try {
				const path = tab === 'open' ? '/api/admin/orders/all' : '/api/admin/orders/completed'
				const res = await api.get<Order[]>(path)
				if (!cancelled) setOrders(res.data ?? [])
			} catch (e) {
				if (!cancelled) toastError(e instanceof Error ? e.message : 'Could not load orders')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		load()
		return () => {
			cancelled = true
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tab])

	return (
		<div>
			<AdminPageHeader
				eyebrow="Fulfillment"
				title="Orders"
				description="Orders customers have placed — paid online, or to pay in cash on delivery. Open an order and move it through Processing → Shipped → Delivered as you pack and send it."
			/>

			<div className="flex gap-6 border-b border-line mb-6">
				{(['open', 'delivered'] as Tab[]).map((t) => (
					<button
						key={t}
						onClick={() => setTab(t)}
						className={`pb-3 text-xs uppercase tracking-[0.15em] border-b-2 -mb-px transition-colors cursor-pointer ${
							tab === t
								? 'border-accent text-ink'
								: 'border-transparent text-muted hover:text-ink'
						}`}
					>
						{t === 'open' ? 'To Fulfill' : 'Delivered'}
					</button>
				))}
			</div>

			{loading ? (
				<p className="text-muted text-sm">Loading…</p>
			) : orders.length === 0 ? (
				<p className="text-muted text-sm border border-line bg-surface p-6">
					{tab === 'open' ? 'No open orders.' : 'No delivered orders yet.'}
				</p>
			) : (
				<div className="border border-line bg-surface overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-line text-left text-xs uppercase tracking-[0.1em] text-muted">
								<th className="px-5 py-3 font-normal">Order</th>
								<th className="px-5 py-3 font-normal">Customer</th>
								<th className="px-5 py-3 font-normal">Date</th>
								<th className="px-5 py-3 font-normal">Payment</th>
								<th className="px-5 py-3 font-normal">Status</th>
								<th className="px-5 py-3 font-normal text-right">Total</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((o) => {
								const customer =
									typeof o.userId === 'object' ? o.userId?.name : null
								return (
									<tr key={o._id} className="border-b border-line last:border-0">
										<td className="px-5 py-3">
											<Link
												href={`/admin/orders/${o._id}`}
												className="text-accent link-underline"
											>
												{o.orderNumber}
											</Link>
										</td>
										<td className="px-5 py-3 text-ink-soft">{customer || '—'}</td>
										<td className="px-5 py-3 text-ink-soft">
											{new Date(o.createdAt).toLocaleDateString('en-ZA', {
												day: 'numeric',
												month: 'short',
												year: 'numeric',
											})}
										</td>
										<td className="px-5 py-3">
											{o.payment.paymentMethod === 'COD' ? (
												<span className="text-[0.65rem] uppercase tracking-[0.1em] text-ink-soft">
													COD{o.payment.codCollected ? ' · collected' : ''}
												</span>
											) : (
												<span className="text-[0.65rem] uppercase tracking-[0.1em] text-ink-soft">
													PayFast
												</span>
											)}
										</td>
										<td className="px-5 py-3">
											<Badge status={o.orderStatus} />
										</td>
										<td className="px-5 py-3 text-ink text-right">
											{formatPrice(o.totalAmount)}
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}
