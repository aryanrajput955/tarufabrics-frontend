'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Product } from '@/lib/types'
import { HomeHero } from '@/components/home/HomeHero'
import { ValueProps } from '@/components/home/ValueProps'
import { MaterialTiles } from '@/components/home/MaterialTiles'
import { ProvenanceSection } from '@/components/home/ProvenanceSection'
import { FeaturedFabrics } from '@/components/home/FeaturedFabrics'
import { ClosingBand } from '@/components/home/ClosingBand'

export default function HomePage() {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		api
			.get<Product[]>('/api/products?limit=8')
			.then((res) => setProducts(res.data ?? []))
			.catch(() => setProducts([]))
			.finally(() => setLoading(false))
	}, [])

	return (
		<>
			<HomeHero />
			<ValueProps />
			<MaterialTiles />
			<ProvenanceSection />
			<FeaturedFabrics products={products} loading={loading} />
			<ClosingBand />
		</>
	)
}
