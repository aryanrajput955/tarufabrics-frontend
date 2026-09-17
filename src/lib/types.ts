// Shared types mirroring the backend models (see ../../backend/models).

export interface ImageRef {
	url: string
	key: string
}

export interface VariantAttribute {
	key: string // e.g. "Color", "Pattern", "Width"
	value: string
}

export interface ProductVariant {
	_id: string
	sku?: string
	attributes: VariantAttribute[]
	price: number
	offer?: number | null
	stock: number
	images: ImageRef[]
}

export interface DescriptionDropdown {
	heading: string
	content: string
}

export interface Faq {
	question: string
	answer: string
}

export interface CategoryRef {
	_id: string
	name: string
	slug: string
	description?: string
}

export interface Category {
	_id: string
	name: string
	slug: string
	description?: string
	color: string
	image?: ImageRef
	isActive: boolean
	createdAt?: string
	updatedAt?: string
}

export interface Product {
	_id: string
	title: string
	slug: string
	category: CategoryRef | string
	brand: string
	sku?: string
	hasVariants: boolean
	variants: ProductVariant[]
	images: ImageRef[]
	description: string
	descriptionDropdowns?: DescriptionDropdown[]
	videoSection?: { heading?: string; video?: { url?: string; key?: string } }
	price: number
	offer: number
	finalPrice?: number
	ratings: number
	reviewCount?: number
	stock: number
	faqs?: Faq[]
	isActive: boolean
	createdAt?: string
	updatedAt?: string
}

export interface Review {
	_id: string
	product: string
	user: { _id: string; name: string } | string
	rating: number
	comment: string
	verifiedPurchase: boolean
	createdAt: string
	updatedAt?: string
}

export interface Address {
	_id: string
	name: string
	phone: string
	address: string
	city: string
	state: string
	pincode: string
	landmark?: string
	isDefault?: boolean
}

export interface User {
	id: string
	name: string
	email: string
	role: 'user' | 'admin'
	phone?: string
	addresses: Address[]
	defaultAddress?: string | null
	orders?: string[]
	isActive?: boolean
	createdAt?: string
	updatedAt?: string
}

export interface CartItem {
	_id?: string
	productId: string
	variantId?: string | null
	variantLabel?: string | null
	title: string
	price: number
	image: string
	quantity: number
	stock: number
}

export interface Cart {
	items: CartItem[]
	totalItems: number
	totalPrice: number
}

export interface AppliedCoupon {
	code: string
	type: 'percent' | 'flat'
	value: number
	discount: number
	cartTotal: number
	finalTotal: number
}

export interface Coupon {
	_id: string
	code: string
	type: 'percent' | 'flat'
	value: number
	maxDiscount?: number | null
	minCartValue: number
	expiresAt?: string | null
	usageLimit?: number | null
	timesUsed: number
	isActive: boolean
	createdAt?: string
	updatedAt?: string
}

export interface OrderItem {
	productId: string
	title: string
	price: number
	quantity: number
	image: string
}

export interface Order {
	_id: string
	orderNumber: string
	userId?: string | { _id: string; name: string; email: string }
	items: OrderItem[]
	shippingAddress: Omit<Address, '_id' | 'isDefault' | 'landmark'> & {
		landmark?: string
	}
	payment: {
		payfastPaymentId?: string
		status: 'pending' | 'completed' | 'failed'
		paymentMethod?: 'PayFast' | 'COD' | string
		/** Only meaningful when paymentMethod is 'COD' — has the cash actually been collected. */
		codCollected?: boolean
	}
	totalAmount: number
	coupon?: { code: string | null; discountAmount: number }
	orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled'
	statusHistory?: { status: string; changedBy: string; changedAt: string }[]
	createdAt: string
	updatedAt?: string
}

export interface Pagination {
	page: number
	limit: number
	total: number
	pages: number
}
