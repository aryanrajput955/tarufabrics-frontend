'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { ProductForm } from '@/components/admin/ProductForm'
import { AdminPageHeader } from '@/components/admin/PageHeader'
import type { Category, Product } from '@/lib/types'

export default function EditProductPage() {
	const { id } = useParams<{ id: string }>()
	const [product, setProduct] = useState<Product | null>(null)
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		Promise.all([
			api.get<Product>(`/api/products/${id}`),
			api.get<Category[]>('/api/categories'),
		]).then(([productRes, categoryRes]) => {
			setProduct(productRes.data ?? null)
			setCategories(categoryRes.data ?? [])
			setLoading(false)
		})
	}, [id])

	return (
		<div>
			<AdminPageHeader
				eyebrow="Catalog"
				title={product ? product.title : 'Edit Product'}
				description="Changes here go live on the storefront as soon as you save."
				backHref="/admin/products"
				backLabel="Back to Products"
			/>
			{loading ? (
				<p className="text-muted text-sm">Loading…</p>
			) : !product ? (
				<p className="text-danger text-sm">Product not found.</p>
			) : (
				<ProductForm product={product} categories={categories} />
			)}
		</div>
	)
}
