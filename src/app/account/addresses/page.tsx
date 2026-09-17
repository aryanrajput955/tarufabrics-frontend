'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import type { Address } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { Field, Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'

const empty = {
	name: '',
	phone: '',
	address: '',
	city: '',
	state: '',
	pincode: '',
	landmark: '',
}

export default function AddressesPage() {
	const { user, refresh } = useAuth()
	const { success, error: toastError } = useToast()
	const [form, setForm] = useState(empty)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [saving, setSaving] = useState(false)

	const addresses = user?.addresses ?? []

	const startEdit = (a: Address) => {
		setForm({
			name: a.name,
			phone: a.phone,
			address: a.address,
			city: a.city,
			state: a.state,
			pincode: a.pincode,
			landmark: a.landmark || '',
		})
		setEditingId(a._id)
		setShowForm(true)
	}

	const resetForm = () => {
		setForm(empty)
		setEditingId(null)
		setShowForm(false)
	}

	const save = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		try {
			if (editingId) {
				await api.put(`/api/auth/profile/addresses/${editingId}`, form)
				success('Address updated')
			} else {
				await api.post('/api/auth/profile/addresses', form)
				success('Address added')
			}
			await refresh()
			resetForm()
		} catch (err) {
			toastError(err instanceof Error ? err.message : 'Could not save address')
		} finally {
			setSaving(false)
		}
	}

	const remove = async (id: string) => {
		try {
			await api.del(`/api/auth/profile/addresses/${id}`)
			await refresh()
			success('Address removed')
		} catch (err) {
			toastError(err instanceof Error ? err.message : 'Could not remove')
		}
	}

	const setDefault = async (id: string) => {
		try {
			await api.patch(`/api/auth/profile/addresses/${id}/default`)
			await refresh()
			success('Default address updated')
		} catch (err) {
			toastError(err instanceof Error ? err.message : 'Could not update')
		}
	}

	return (
		<div>
			<div className="flex items-start justify-between mb-8 gap-4">
				<div>
					<p className="eyebrow mb-2">Address Book</p>
					<h1 className="font-display text-3xl md:text-4xl text-ink">Addresses</h1>
				</div>
				{!showForm && (
					<Button size="sm" onClick={() => setShowForm(true)}>
						Add New
					</Button>
				)}
			</div>

			{showForm && (
				<form
					onSubmit={save}
					className="border border-line rounded-sm p-6 bg-surface mb-8 space-y-4"
				>
					<p className="eyebrow">{editingId ? 'Edit Address' : 'New Address'}</p>
					<div className="grid sm:grid-cols-2 gap-4">
						<Field label="Full Name">
							<Input
								required
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
							/>
						</Field>
						<Field label="Phone">
							<Input
								required
								value={form.phone}
								onChange={(e) => setForm({ ...form, phone: e.target.value })}
								placeholder="e.g. 0821234567"
							/>
						</Field>
					</div>
					<Field label="Address">
						<Input
							required
							value={form.address}
							onChange={(e) => setForm({ ...form, address: e.target.value })}
						/>
					</Field>
					<div className="grid sm:grid-cols-3 gap-4">
						<Field label="City">
							<Input
								required
								value={form.city}
								onChange={(e) => setForm({ ...form, city: e.target.value })}
								placeholder="e.g. Cape Town"
							/>
						</Field>
						<Field label="Province">
							<Input
								required
								value={form.state}
								onChange={(e) => setForm({ ...form, state: e.target.value })}
								placeholder="e.g. Western Cape"
							/>
						</Field>
						<Field label="Postal Code">
							<Input
								required
								value={form.pincode}
								onChange={(e) => setForm({ ...form, pincode: e.target.value })}
								placeholder="e.g. 8001"
							/>
						</Field>
					</div>
					<Field label="Landmark (optional)">
						<Input
							value={form.landmark}
							onChange={(e) => setForm({ ...form, landmark: e.target.value })}
						/>
					</Field>
					<div className="flex gap-3">
						<Button type="submit" loading={saving}>
							{editingId ? 'Update' : 'Save'} Address
						</Button>
						<Button type="button" variant="ghost" onClick={resetForm}>
							Cancel
						</Button>
					</div>
				</form>
			)}

			{addresses.length === 0 && !showForm ? (
				<div className="border border-line rounded-sm p-12 text-center bg-surface text-muted">
					No saved addresses yet.
				</div>
			) : (
				<div className="grid sm:grid-cols-2 gap-4">
					{addresses.map((a) => (
						<div
							key={a._id}
							className="border border-line rounded-sm p-5 bg-surface"
						>
							<div className="flex items-start justify-between">
								<p className="text-ink font-medium">{a.name}</p>
								{a.isDefault && (
									<span className="text-[0.6rem] uppercase tracking-[0.15em] text-accent border border-accent px-2 py-0.5">
										Default
									</span>
								)}
							</div>
							<p className="text-sm text-ink-soft mt-2 leading-relaxed">
								{a.address}
								{a.landmark ? `, ${a.landmark}` : ''}
								<br />
								{a.city}, {a.state} — {a.pincode}
								<br />
								{a.phone}
							</p>
							<div className="flex gap-4 mt-4 text-xs uppercase tracking-[0.12em]">
								<button
									onClick={() => startEdit(a)}
									className="text-ink-soft hover:text-ink link-underline"
								>
									Edit
								</button>
								{!a.isDefault && (
									<button
										onClick={() => setDefault(a._id)}
										className="text-ink-soft hover:text-accent link-underline"
									>
										Set Default
									</button>
								)}
								<button
									onClick={() => remove(a._id)}
									className="text-muted hover:text-danger link-underline"
								>
									Remove
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
