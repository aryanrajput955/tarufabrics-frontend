'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Badge } from '@/components/admin/Badge'
import { AdminPageHeader } from '@/components/admin/PageHeader'
import { FileUploadButton } from '@/components/admin/FileUploadButton'
import type { Category, ImageRef } from '@/lib/types'

// `image` is either a new base64 data URI (string), an existing { url, key }
// ref, null to clear it, or undefined to leave it untouched on update.
type CategoryForm = {
	name: string
	description: string
	color: string
	image?: string | ImageRef | null
}

const emptyForm: CategoryForm = { name: '', description: '', color: '#8b6f47' }

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}

function imagePreviewSrc(image: CategoryForm['image']): string | null {
	if (!image) return null
	if (typeof image === 'string') return image
	return image.url || null
}

export default function AdminCategoriesPage() {
	const { error: toastError, success } = useToast()
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)
	const [form, setForm] = useState<CategoryForm>(emptyForm)
	const [creating, setCreating] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editForm, setEditForm] = useState<CategoryForm>(emptyForm)
	const [busyId, setBusyId] = useState<string | null>(null)

	const load = async () => {
		setLoading(true)
		try {
			const res = await api.get<Category[]>('/api/categories?includeInactive=true')
			setCategories(res.data ?? [])
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not load categories')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const createCategory = async (e: React.FormEvent) => {
		e.preventDefault()
		setCreating(true)
		try {
			await api.post('/api/categories', {
				...form,
				image: typeof form.image === 'string' ? form.image : undefined,
			})
			setForm(emptyForm)
			success('Category created')
			await load()
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not create category')
		} finally {
			setCreating(false)
		}
	}

	const startEdit = (c: Category) => {
		setEditingId(c._id)
		setEditForm({
			name: c.name,
			description: c.description ?? '',
			color: c.color,
			// keep the current image unless the admin changes it
			image: c.image?.url ? c.image : undefined,
		})
	}

	const saveEdit = async (id: string) => {
		setBusyId(id)
		try {
			// Only send `image` when it changed: a new base64 string, or an
			// explicit null to clear. Leaving it as the existing {url,key} or
			// undefined means "no change".
			const payload: Record<string, unknown> = {
				name: editForm.name,
				description: editForm.description,
				color: editForm.color,
			}
			if (typeof editForm.image === 'string') payload.image = editForm.image
			else if (editForm.image === null) payload.image = null
			await api.put(`/api/categories/${id}`, payload)
			setEditingId(null)
			success('Category updated')
			await load()
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not update category')
		} finally {
			setBusyId(null)
		}
	}

	const toggleActive = async (c: Category) => {
		setBusyId(c._id)
		try {
			await api.put(`/api/categories/${c._id}`, { isActive: !c.isActive })
			setCategories((prev) =>
				prev.map((x) => (x._id === c._id ? { ...x, isActive: !x.isActive } : x))
			)
			success(c.isActive ? 'Category deactivated' : 'Category activated')
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not update category')
		} finally {
			setBusyId(null)
		}
	}

	const remove = async (c: Category) => {
		if (!window.confirm(`Delete "${c.name}"?`)) return
		setBusyId(c._id)
		try {
			await api.del(`/api/categories/${c._id}`)
			setCategories((prev) => prev.filter((x) => x._id !== c._id))
			success('Category deleted')
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not delete category')
		} finally {
			setBusyId(null)
		}
	}

	return (
		<div>
			<AdminPageHeader
				eyebrow="Catalog"
				title="Categories"
				description="The fabric types customers browse and filter by — e.g. Dutch Satin, Twill, Lace. Every product must belong to one. Give each a photo so it looks good on the homepage and shop filters."
			/>

			<form
				onSubmit={createCategory}
				className="border border-line bg-surface p-6 mb-8 grid sm:grid-cols-[1fr_1fr_auto_auto] gap-4 items-end"
			>
				<Field label="Name">
					<Input
						required
						value={form.name}
						onChange={(e) => setForm({ ...form, name: e.target.value })}
					/>
				</Field>
				<Field label="Description">
					<Input
						value={form.description}
						onChange={(e) => setForm({ ...form, description: e.target.value })}
					/>
				</Field>
				<Field label="Color">
					<input
						type="color"
						value={form.color}
						onChange={(e) => setForm({ ...form, color: e.target.value })}
						className="h-11 w-14 border border-line rounded-sm cursor-pointer"
					/>
				</Field>
				<Button type="submit" loading={creating}>
					+ Add Category
				</Button>

				<div className="sm:col-span-full flex items-center gap-4">
					{imagePreviewSrc(form.image) && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={imagePreviewSrc(form.image)!}
							alt=""
							className="w-16 h-20 object-cover border border-line shrink-0"
						/>
					)}
					<div>
						<label className="block text-xs uppercase tracking-[0.1em] text-muted mb-1.5">
							Image (optional)
						</label>
						<FileUploadButton
							label="Upload Image"
							accept="image/*"
							onFiles={async (files) => {
								const file = files?.[0]
								if (!file) return
								const b64 = await fileToBase64(file)
								setForm((f) => ({ ...f, image: b64 }))
							}}
						/>
						{form.image && (
							<button
								type="button"
								onClick={() => setForm((f) => ({ ...f, image: undefined }))}
								className="ml-3 text-xs uppercase tracking-[0.15em] text-muted hover:text-danger link-underline cursor-pointer"
							>
								Remove
							</button>
						)}
					</div>
				</div>
			</form>

			{loading ? (
				<p className="text-muted text-sm">Loading…</p>
			) : categories.length === 0 ? (
				<p className="text-muted text-sm border border-line bg-surface p-6">
					No categories yet.
				</p>
			) : (
				<div className="border border-line bg-surface overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-line text-left text-xs uppercase tracking-[0.1em] text-muted">
								<th className="px-5 py-3 font-normal">Image</th>
								<th className="px-5 py-3 font-normal">Category</th>
								<th className="px-5 py-3 font-normal">Description</th>
								<th className="px-5 py-3 font-normal">Status</th>
								<th className="px-5 py-3 font-normal text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{categories.map((c) => {
								const busy = busyId === c._id
								const editing = editingId === c._id
								return (
									<tr
										key={c._id}
										className={`border-b border-line last:border-0 ${busy ? 'opacity-50' : ''}`}
									>
										{editing ? (
											<>
												<td className="px-5 py-3">
													<div className="flex flex-col gap-1.5">
														{imagePreviewSrc(editForm.image) ? (
															// eslint-disable-next-line @next/next/no-img-element
															<img
																src={imagePreviewSrc(editForm.image)!}
																alt=""
																className="w-12 h-16 object-cover border border-line"
															/>
														) : (
															<span
																className="w-12 h-16 border border-line block"
																style={{ backgroundColor: editForm.color }}
															/>
														)}
														<FileUploadButton
															label="Upload"
															accept="image/*"
															onFiles={async (files) => {
																const file = files?.[0]
																if (!file) return
																const b64 = await fileToBase64(file)
																setEditForm((f) => ({ ...f, image: b64 }))
															}}
														/>
														{editForm.image && (
															<button
																type="button"
																onClick={() =>
																	setEditForm((f) => ({ ...f, image: null }))
																}
																className="text-[0.6rem] uppercase tracking-[0.15em] text-muted hover:text-danger link-underline cursor-pointer text-left"
															>
																Remove
															</button>
														)}
													</div>
												</td>
												<td className="px-5 py-3">
													<div className="flex items-center gap-2">
														<input
															type="color"
															value={editForm.color}
															onChange={(e) =>
																setEditForm({ ...editForm, color: e.target.value })
															}
															className="h-9 w-9 border border-line rounded-sm cursor-pointer shrink-0"
														/>
														<Input
															value={editForm.name}
															onChange={(e) =>
																setEditForm({ ...editForm, name: e.target.value })
															}
														/>
													</div>
												</td>
												<td className="px-5 py-3">
													<Input
														value={editForm.description}
														onChange={(e) =>
															setEditForm({ ...editForm, description: e.target.value })
														}
													/>
												</td>
												<td className="px-5 py-3">
													<Badge status={c.isActive ? 'active' : 'inactive'} />
												</td>
												<td className="px-5 py-3">
													<div className="flex items-center justify-end gap-4 whitespace-nowrap">
														<button
															onClick={() => saveEdit(c._id)}
															disabled={busy}
															className="text-xs uppercase tracking-[0.15em] text-accent link-underline cursor-pointer"
														>
															Save
														</button>
														<button
															onClick={() => setEditingId(null)}
															className="text-xs uppercase tracking-[0.15em] text-muted link-underline cursor-pointer"
														>
															Cancel
														</button>
													</div>
												</td>
											</>
										) : (
											<>
												<td className="px-5 py-3">
													{c.image?.url ? (
														// eslint-disable-next-line @next/next/no-img-element
														<img
															src={c.image.url}
															alt={c.name}
															className="w-12 h-16 object-cover border border-line"
														/>
													) : (
														<span
															className="w-12 h-16 border border-line block"
															style={{ backgroundColor: c.color }}
														/>
													)}
												</td>
												<td className="px-5 py-3">
													<div className="flex items-center gap-2.5">
														<span
															className="w-4 h-4 rounded-full border border-line shrink-0"
															style={{ backgroundColor: c.color }}
														/>
														<span className="text-ink">{c.name}</span>
													</div>
												</td>
												<td className="px-5 py-3 text-ink-soft max-w-[320px] truncate">
													{c.description || '—'}
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
																	? 'Hide this category (and its filter chip) from the shop'
																	: 'Show this category on the shop again'
															}
															className="text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink link-underline cursor-pointer disabled:opacity-50"
														>
															{c.isActive ? 'Deactivate' : 'Activate'}
														</button>
														<button
															onClick={() => remove(c)}
															disabled={busy}
															title="Permanently remove this category — only possible if no products use it"
															className="text-xs uppercase tracking-[0.15em] text-muted hover:text-danger link-underline cursor-pointer disabled:opacity-50"
														>
															Delete
														</button>
													</div>
												</td>
											</>
										)}
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
