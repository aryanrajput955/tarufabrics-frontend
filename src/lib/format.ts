import { site } from './site'
import type { Product, ProductVariant } from './types'

/** Format a number as ZAR currency, e.g. 1299 -> "R1,299". */
export function formatPrice(amount: number): string {
	return new Intl.NumberFormat(site.locale, {
		style: 'currency',
		currency: site.currency,
		maximumFractionDigits: 0,
	}).format(amount || 0)
}

/** Price after applying an offer (%). */
export function applyOffer(price: number, offer?: number | null): number {
	if (!offer || offer <= 0) return price
	return Math.round(price - (price * offer) / 100)
}

/** The effective selling price for a product (uses finalPrice when present). */
export function productPrice(product: Product): number {
	if (typeof product.finalPrice === 'number' && product.finalPrice > 0) {
		return product.finalPrice
	}
	return applyOffer(product.price, product.offer)
}

/** Human label for a variant, e.g. "Indigo / 44in". */
export function variantLabel(variant: ProductVariant): string {
	return variant.attributes.map((a) => a.value).join(' / ')
}

/** First image URL for a product (falls back to a placeholder). */
export function productImage(product: Product): string | null {
	return product.images?.[0]?.url ?? null
}

/** Whether a product is purchasable. */
export function inStock(product: Product): boolean {
	return (product.stock ?? 0) > 0
}
