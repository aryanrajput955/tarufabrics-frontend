'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { useToast } from '@/components/ui/Toast'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Badge } from '@/components/admin/Badge'
import { AdminPageHeader } from '@/components/admin/PageHeader'
import { ProductImage } from '@/components/shop/ProductImage'
import type { Product, Category, Pagination } from '@/lib/types'

export default function AdminProductsPage() {
	const { error: toastError, success } = useToast()
	const [products, setProducts] = useState<Product[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [pagination, setPagination] = useState<Pagination | null>(null)
	const [page, setPage] = useState(1)
	const [queryInput, setQueryInput] = useState('')
	const [search, setSearch] = useState('')
	const [category, setCategory] = useState('')
	const [stockStatus, setStockStatus] = useState('')
	const [loading, setLoading] = useState(true)
	const [busyId, setBusyId] = useState<string | null>(null)

	useEffect(() => {
		const t = setTimeout(() => setSearch(queryInput.trim()), 350)
		return () => clearTimeout(t)
	}, [queryInput])

	useEffect(() => {
		api.get<Category[]>('/api/categories').then((res) => setCategories(res.data ?? []))
	}, [])

	useEffect(() => {
		let cancelled = false
		async function load() {
			setLoading(true)
			try {
				const params = new URLSearchParams({
					includeInactive: 'true',
					page: String(page),
					limit: '10',
				})
				if (search) params.set('search', search)
				if (category) params.set('category', category)
				if (stockStatus) params.set('stockStatus', stockStatus)

				const res = await api.get<Product[]>(`/api/products?${params.toString()}`)
				if (cancelled) return
				setProducts(res.data ?? [])
				setPagination(res.pagination ?? null)
			} catch (e) {
				if (!cancelled) toastError(e instanceof Error ? e.message : 'Could not load products')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		load()
		return () => {
			cancelled = true
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, search, category, stockStatus])

	const toggleActive = async (product: Product) => {
		setBusyId(product._id)
		try {
			await api.put(`/api/products/${product._id}`, { isActive: !product.isActive })
			setProducts((prev) =>
				prev.map((p) => (p._id === product._id ? { ...p, isActive: !p.isActive } : p))
			)
			success(product.isActive ? 'Product deactivated' : 'Product activated')
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not update product')
		} finally {
			setBusyId(null)
		}
	}

	const remove = async (product: Product) => {
		if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return
		setBusyId(product._id)
		try {
			await api.del(`/api/products/${product._id}`)
			setProducts((prev) => prev.filter((p) => p._id !== product._id))
			success('Product deleted')
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not delete product')
		} finally {
			setBusyId(null)
		}
	}

	return (
		<div>
			<AdminPageHeader
				eyebrow="Catalog"
				title="Products"
				description="Every fabric you sell. Deactivate hides a fabric from the shop without losing it; Delete removes it permanently."
				action={<ButtonLink href="/admin/products/new">+ Add Product</ButtonLink>}
			/>

			<div className="flex flex-col sm:flex-row gap-3 mb-6">
				<input
					type="text"
					value={queryInput}
					onChange={(e) => {
						setQueryInput(e.target.value)
						setPage(1)
					}}
					placeholder="Search products…"
					className="h-10 px-3.5 flex-1 bg-surface border border-line rounded-sm text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
				/>
				<select
					value={category}
					onChange={(e) => {
						setCategory(e.target.value)
						setPage(1)
					}}
					className="h-10 px-3 bg-surface border border-line rounded-sm text-sm text-ink focus:outline-none focus:border-accent"
				>
					<option value="">All Categories</option>
					{categories.map((c) => (
						<option key={c._id} value={c._id}>
							{c.name}
						</option>
					))}
				</select>
				<select
					value={stockStatus}
					onChange={(e) => {
						setStockStatus(e.target.value)
						setPage(1)
					}}
					className="h-10 px-3 bg-surface border border-line rounded-sm text-sm text-ink focus:outline-none focus:border-accent"
				>
					<option value="">All Stock</option>
					<option value="in_stock">In Stock</option>
					<option value="low_stock">Low Stock</option>
					<option value="no_stock">Out of Stock</option>
				</select>
			</div>

			{loading ? (
				<p className="text-muted text-sm">Loading…</p>
			) : products.length === 0 ? (
				<div className="text-sm border border-line bg-surface p-6">
					{search || category || stockStatus ? (
						<p className="text-muted">No products match these filters.</p>
					) : (
						<>
							<p className="text-ink mb-1">No products yet</p>
							<p className="text-muted mb-4">
								Add your first fabric to start selling — it&apos;ll need a category, a
								price and at least one photo.
							</p>
							<ButtonLink href="/admin/products/new" size="sm">
								+ Add Product
							</ButtonLink>
						</>
					)}
				</div>
			) : (
				<div className="border border-line bg-surface overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-line text-left text-xs uppercase tracking-[0.1em] text-muted">
								<th className="px-5 py-3 font-normal">Product</th>
								<th className="px-5 py-3 font-normal">Category</th>
								<th className="px-5 py-3 font-normal text-right">Price</th>
								<th className="px-5 py-3 font-normal text-right">Stock</th>
								<th className="px-5 py-3 font-normal">Status</th>
								<th className="px-5 py-3 font-normal text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{products.map((p) => {
								const busy = busyId === p._id
								const cat = typeof p.category === 'object' ? p.category?.name : ''
								return (
									<tr
										key={p._id}
										className={`border-b border-line last:border-0 ${busy ? 'opacity-50' : ''}`}
									>
										<td className="px-5 py-3">
											<div className="flex items-center gap-3">
												<div className="w-10 h-12 shrink-0 bg-accent-soft overflow-hidden">
													<ProductImage
														src={p.images?.[0]?.url}
														alt={p.title}
														className="h-full w-full"
													/>
												</div>
												<div className="min-w-0">
													<p className="text-ink truncate max-w-[220px]">{p.title}</p>
													<p className="text-xs text-muted">{p.sku}</p>
												</div>
											</div>
										</td>
										<td className="px-5 py-3 text-ink-soft">{cat || '—'}</td>
										<td className="px-5 py-3 text-ink text-right whitespace-nowrap">
											{formatPrice(p.finalPrice ?? p.price)}
										</td>
										<td className="px-5 py-3 text-right">
											<span className={p.stock <= 10 ? 'text-danger' : 'text-ink'}>
												{p.stock}
											</span>
										</td>
										<td className="px-5 py-3">
											<Badge status={p.isActive ? 'active' : 'inactive'} />
										</td>
										<td className="px-5 py-3">
											<div className="flex items-center justify-end gap-4 whitespace-nowrap">
												<Link
													href={`/admin/products/${p._id}`}
													className="text-xs uppercase tracking-[0.15em] text-accent link-underline"
												>
													Edit
												</Link>
												<button
													onClick={() => toggleActive(p)}
													disabled={busy}
													title={
														p.isActive
															? 'Hide from the shop — you can reactivate it any time'
															: 'Show this fabric on the shop again'
													}
													className="text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink link-underline cursor-pointer disabled:opacity-50"
												>
													{p.isActive ? 'Deactivate' : 'Activate'}
												</button>
												<button
													onClick={() => remove(p)}
													disabled={busy}
													title="Permanently remove this product — this cannot be undone"
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

			{pagination && pagination.pages > 1 && (
				<div className="flex items-center justify-between mt-5 text-sm">
					<Button
						variant="ghost"
						size="sm"
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
					>
						Previous
					</Button>
					<span className="text-muted text-xs">
						Page {pagination.page} of {pagination.pages}
					</span>
					<Button
						variant="ghost"
						size="sm"
						disabled={page >= pagination.pages}
						onClick={() => setPage((p) => p + 1)}
					>
						Next
					</Button>
				</div>
			)}
		</div>
	)
}
