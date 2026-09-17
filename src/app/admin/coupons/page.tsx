'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Badge } from '@/components/admin/Badge'
import { AdminPageHeader } from '@/components/admin/PageHeader'
import type { Coupon } from '@/lib/types'

interface CouponForm {
	code: string
	type: 'percent' | 'flat'
	value: number
	maxDiscount: string
	minCartValue: number
	expiresAt: string
	usageLimit: string
}

const emptyForm: CouponForm = {
	code: '',
	type: 'percent',
	value: 10,
	maxDiscount: '',
	minCartValue: 0,
	expiresAt: '',
	usageLimit: '',
}

function toPayload(f: CouponForm) {
	return {
		code: f.code,
		type: f.type,
		value: f.value,
		maxDiscount: f.maxDiscount ? Number(f.maxDiscount) : null,
		minCartValue: f.minCartValue,
		expiresAt: f.expiresAt || null,
		usageLimit: f.usageLimit ? Number(f.usageLimit) : null,
	}
}

function toForm(c: Coupon): CouponForm {
	return {
		code: c.code,
		type: c.type,
		value: c.value,
		maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : '',
		minCartValue: c.minCartValue,
		expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
		usageLimit: c.usageLimit != null ? String(c.usageLimit) : '',
	}
}

export default function AdminCouponsPage() {
	const { error: toastError, success } = useToast()
	const [coupons, setCoupons] = useState<Coupon[]>([])
	const [loading, setLoading] = useState(true)
	const [showCreate, setShowCreate] = useState(false)
	const [form, setForm] = useState<CouponForm>(emptyForm)
	const [creating, setCreating] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editForm, setEditForm] = useState<CouponForm>(emptyForm)
	const [busyId, setBusyId] = useState<string | null>(null)

	const load = async () => {
		setLoading(true)
		try {
			const res = await api.get<Coupon[]>('/api/admin/coupons')
			setCoupons(res.data ?? [])
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not load coupons')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const createCoupon = async (e: React.FormEvent) => {
		e.preventDefault()
		setCreating(true)
		try {
			await api.post('/api/admin/coupons', toPayload(form))
			setForm(emptyForm)
			setShowCreate(false)
			success('Coupon created')
			await load()
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not create coupon')
		} finally {
			setCreating(false)
		}
	}

	const startEdit = (c: Coupon) => {
		setEditingId(c._id)
		setEditForm(toForm(c))
	}

	const saveEdit = async (id: string) => {
		setBusyId(id)
		try {
			await api.put(`/api/admin/coupons/${id}`, toPayload(editForm))
			setEditingId(null)
			success('Coupon updated')
			await load()
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not update coupon')
		} finally {
			setBusyId(null)
		}
	}

	const toggleActive = async (c: Coupon) => {
		setBusyId(c._id)
		try {
			await api.put(`/api/admin/coupons/${c._id}`, { isActive: !c.isActive })
			setCoupons((prev) =>
				prev.map((x) => (x._id === c._id ? { ...x, isActive: !x.isActive } : x))
			)
			success(c.isActive ? 'Coupon deactivated' : 'Coupon activated')
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not update coupon')
		} finally {
			setBusyId(null)
		}
	}

	const remove = async (c: Coupon) => {
		if (!window.confirm(`Delete coupon "${c.code}"?`)) return
		setBusyId(c._id)
		try {
			await api.del(`/api/admin/coupons/${c._id}`)
			setCoupons((prev) => prev.filter((x) => x._id !== c._id))
			success('Coupon deleted')
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not delete coupon')
		} finally {
			setBusyId(null)
		}
	}

	const CouponFields = ({
		value,
		onChange,
	}: {
		value: CouponForm
		onChange: (f: CouponForm) => void
	}) => (
		<div className="grid sm:grid-cols-3 gap-4">
			<Field label="Code" required hint="What the customer types at checkout, e.g. SAVE10.">
				<Input
					required
					value={value.code}
					onChange={(e) => onChange({ ...value, code: e.target.value.toUpperCase() })}
				/>
			</Field>
			<Field label="Type" required>
				<select
					value={value.type}
					onChange={(e) => onChange({ ...value, type: e.target.value as 'percent' | 'flat' })}
					className="w-full h-11 px-3.5 bg-surface border border-line rounded-sm text-sm text-ink focus:outline-none focus:border-accent"
				>
					<option value="percent">Percent off</option>
					<option value="flat">Flat amount off</option>
				</select>
			</Field>
			<Field label={value.type === 'percent' ? 'Value (%)' : 'Value (R)'} required>
				<Input
					type="number"
					min={0}
					required
					value={value.value}
					onChange={(e) => onChange({ ...value, value: Number(e.target.value) })}
				/>
			</Field>
			{value.type === 'percent' && (
				<Field
					label="Max Discount (R, optional)"
					hint="Caps the discount in rand so a big % off a big cart doesn't cost too much."
				>
					<Input
						type="number"
						min={0}
						value={value.maxDiscount}
						onChange={(e) => onChange({ ...value, maxDiscount: e.target.value })}
					/>
				</Field>
			)}
			<Field
				label="Min Cart Value (R)"
				hint="Cart must reach this total before the code works. Leave 0 for no minimum."
			>
				<Input
					type="number"
					min={0}
					value={value.minCartValue}
					onChange={(e) => onChange({ ...value, minCartValue: Number(e.target.value) })}
				/>
			</Field>
			<Field label="Expires (optional)" hint="Stops working automatically after this date.">
				<Input
					type="date"
					value={value.expiresAt}
					onChange={(e) => onChange({ ...value, expiresAt: e.target.value })}
				/>
			</Field>
			<Field
				label="Usage Limit (optional)"
				hint="Total number of times this code can be used across all customers."
			>
				<Input
					type="number"
					min={0}
					value={value.usageLimit}
					onChange={(e) => onChange({ ...value, usageLimit: e.target.value })}
				/>
			</Field>
		</div>
	)

	return (
		<div>
			<AdminPageHeader
				eyebrow="Promotions"
				title="Coupons"
				description="Discount codes customers can enter at checkout for a percentage or flat-rand discount off their order."
				action={
					<Button onClick={() => setShowCreate((s) => !s)} variant={showCreate ? 'ghost' : 'primary'}>
						{showCreate ? 'Cancel' : '+ Add Coupon'}
					</Button>
				}
			/>

			{showCreate && (
				<form
					onSubmit={createCoupon}
					className="border border-line bg-surface p-6 mb-8 space-y-4"
				>
					<CouponFields value={form} onChange={setForm} />
					<Button type="submit" loading={creating}>
						Create Coupon
					</Button>
				</form>
			)}

			{loading ? (
				<p className="text-muted text-sm">Loading…</p>
			) : coupons.length === 0 ? (
				<p className="text-muted text-sm border border-line bg-surface p-6">
					No coupons yet.
				</p>
			) : (
				<div className="border border-line bg-surface overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-line text-left text-xs uppercase tracking-[0.1em] text-muted">
								<th className="px-5 py-3 font-normal">Code</th>
								<th className="px-5 py-3 font-normal">Discount</th>
								<th className="px-5 py-3 font-normal">Min Cart</th>
								<th className="px-5 py-3 font-normal">Usage</th>
								<th className="px-5 py-3 font-normal">Status</th>
								<th className="px-5 py-3 font-normal text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{coupons.map((c) => {
								const busy = busyId === c._id
								const editing = editingId === c._id
								if (editing) {
									return (
										<tr key={c._id} className="border-b border-line last:border-0">
											<td colSpan={6} className="px-5 py-5">
												<div className="space-y-4">
													<CouponFields value={editForm} onChange={setEditForm} />
													<div className="flex gap-4">
														<Button size="sm" onClick={() => saveEdit(c._id)} loading={busy}>
															Save
														</Button>
														<Button
															size="sm"
															variant="ghost"
															onClick={() => setEditingId(null)}
														>
															Cancel
														</Button>
													</div>
												</div>
											</td>
										</tr>
									)
								}
								return (
									<tr
										key={c._id}
										className={`border-b border-line last:border-0 ${busy ? 'opacity-50' : ''}`}
									>
										<td className="px-5 py-3 text-ink">{c.code}</td>
										<td className="px-5 py-3 text-ink-soft">
											{c.type === 'percent'
												? `${c.value}% off${c.maxDiscount ? ` (up to ${formatPrice(c.maxDiscount)})` : ''}`
												: `${formatPrice(c.value)} off`}
										</td>
										<td className="px-5 py-3 text-ink-soft">{formatPrice(c.minCartValue)}</td>
										<td className="px-5 py-3 text-ink-soft">
											{c.timesUsed}
											{c.usageLimit != null ? ` / ${c.usageLimit}` : ''}
										</td>
										<td className="px-5 py-3">
											<Badge status={c.isActive ? 'active' : 'inactive'} />
										</td>
										<td className="px-5 py-3">
											<div className="flex items-center justify-end gap-4 whitespace-nowrap">
												<button
													onClick={() => startEdit(c)}
													className="text-xs uppercase tracking-[0.15em] text-accent link-underline cursor-pointer"
												>
													Edit
												</button>
												<button
													onClick={() => toggleActive(c)}
													disabled={busy}
													title={
														c.isActive
															? 'Stop customers from using this code, without deleting it'
															: 'Let customers use this code again'
													}
													className="text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink link-underline cursor-pointer disabled:opacity-50"
												>
													{c.isActive ? 'Deactivate' : 'Activate'}
												</button>
												<button
													onClick={() => remove(c)}
													disabled={busy}
													title="Permanently remove this coupon — this cannot be undone"
													className="text-xs uppercase tracking-[0.15em] text-muted hover:text-danger link-underline cursor-pointer disabled:opacity-50"
												>
													Delete
												</button>
											</div>
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
