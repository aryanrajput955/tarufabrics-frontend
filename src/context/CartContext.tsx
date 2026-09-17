'use client'

import {
	createContext,
	useContext,
	useCallback,
	useEffect,
	useState,
	type ReactNode,
} from 'react'
import { api } from '@/lib/api'
import type { AppliedCoupon, Cart } from '@/lib/types'
import { useAuth } from './AuthContext'

const EMPTY: Cart = { items: [], totalItems: 0, totalPrice: 0 }

interface CartContextValue {
	cart: Cart
	loading: boolean
	refresh: () => Promise<void>
	addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>
	updateItem: (productId: string, quantity: number) => Promise<void>
	removeItem: (productId: string) => Promise<void>
	clear: () => Promise<void>
	drawerOpen: boolean
	openDrawer: () => void
	closeDrawer: () => void
	coupon: AppliedCoupon | null
	applyCoupon: (code: string) => Promise<void>
	removeCoupon: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
	const { user, loading: authLoading } = useAuth()
	const [cart, setCart] = useState<Cart>(EMPTY)
	const [loading, setLoading] = useState(false)
	const [drawerOpen, setDrawerOpen] = useState(false)
	const openDrawer = useCallback(() => setDrawerOpen(true), [])
	const closeDrawer = useCallback(() => setDrawerOpen(false), [])
	const [coupon, setCoupon] = useState<AppliedCoupon | null>(null)
	const removeCoupon = useCallback(() => setCoupon(null), [])
	const applyCoupon = useCallback(async (code: string) => {
		const res = await api.post<AppliedCoupon>('/api/coupons/validate', { code })
		if (res.data) setCoupon(res.data)
	}, [])

	const refresh = useCallback(async () => {
		if (!user) {
			setCart(EMPTY)
			return
		}
		setLoading(true)
		try {
			const res = await api.get<Cart>('/api/cart')
			setCart(res.data ?? EMPTY)
		} catch {
			setCart(EMPTY)
		} finally {
			setLoading(false)
		}
	}, [user])

	// Load / clear cart as auth state settles
	useEffect(() => {
		if (!authLoading) refresh()
	}, [authLoading, refresh])

	const addItem = useCallback(
		async (productId: string, quantity = 1, variantId?: string) => {
			const res = await api.post<Cart>('/api/cart/add', {
				productId,
				quantity,
				variantId,
			})
			if (res.data) setCart(res.data)
			else await refresh()
		},
		[refresh]
	)

	const updateItem = useCallback(async (productId: string, quantity: number) => {
		const res = await api.put<Cart>('/api/cart/update', { productId, quantity })
		if (res.data) setCart(res.data)
		setCoupon(null)
	}, [])

	const removeItem = useCallback(async (productId: string) => {
		const res = await api.del<Cart>(`/api/cart/remove/${productId}`)
		if (res.data) setCart(res.data)
		setCoupon(null)
	}, [])

	const clear = useCallback(async () => {
		await api.del('/api/cart/clear')
		setCart(EMPTY)
		setCoupon(null)
	}, [])

	return (
		<CartContext.Provider
			value={{
				cart,
				loading,
				refresh,
				addItem,
				updateItem,
				removeItem,
				clear,
				drawerOpen,
				openDrawer,
				closeDrawer,
				coupon,
				applyCoupon,
				removeCoupon,
			}}
		>
			{children}
		</CartContext.Provider>
	)
}

export function useCart() {
	const ctx = useContext(CartContext)
	if (!ctx) throw new Error('useCart must be used within a CartProvider')
	return ctx
}
