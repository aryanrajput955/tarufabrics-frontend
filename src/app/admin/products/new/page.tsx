'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { ProductForm } from '@/components/admin/ProductForm'
import { AdminPageHeader } from '@/components/admin/PageHeader'
import type { Category } from '@/lib/types'

export default function NewProductPage() {
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		api
			.get<Category[]>('/api/categories')
			.then((res) => setCategories(res.data ?? []))
			.finally(() => setLoading(false))
	}, [])

	return (
		<div>
			<AdminPageHeader
				eyebrow="Catalog"
				title="Add Product"
				description="Fill in the basics, add at least one photo, and set a price — everything else on this page is optional."
				backHref="/admin/products"
				backLabel="Back to Products"
			/>
			{!loading && categories.length === 0 ? (
				<div className="border border-line bg-surface p-6 max-w-lg">
					<p className="text-ink mb-1">Add a category first</p>
					<p className="text-sm text-muted mb-4">
						Every product needs a category (e.g. &quot;Dutch Satin&quot;) so customers can
						browse and filter for it.
					</p>
					<Link
						href="/admin/categories"
						className="text-xs uppercase tracking-[0.15em] text-accent link-underline"
					>
						Go to Categories →
					</Link>
				</div>
			) : (
				<ProductForm categories={categories} />
			)}
		</div>
	)
}
