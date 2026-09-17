'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { site } from '@/lib/site'
import { useToast } from '@/components/ui/Toast'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Field, Input, Textarea, Label } from '@/components/ui/Field'
import { FileUploadButton } from '@/components/admin/FileUploadButton'
import type { Category, Product, ProductVariant, VariantAttribute } from '@/lib/types'

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}

interface VariantDraft {
	_id?: string
	attributes: VariantAttribute[]
	price: number
	offer: number | null
	stock: number
	newImages: string[]
	existingImages: { url: string; key: string }[]
}

function toVariantDraft(v: ProductVariant): VariantDraft {
	return {
		_id: v._id,
		attributes: v.attributes,
		price: v.price,
		offer: v.offer ?? null,
		stock: v.stock,
		newImages: [],
		existingImages: v.images ?? [],
	}
}

/** Bordered, numbered card used for every top-level section of the form —
 *  gives an otherwise long page clear stopping points to scan. */
function FormSection({
	number,
	title,
	description,
	children,
}: {
	number: number
	title: string
	description?: string
	children: ReactNode
}) {
	return (
		<section className="border border-line bg-surface p-6 space-y-4">
			<div>
				<h2 className="font-display text-xl text-ink flex items-center gap-2.5">
					<span className="w-6 h-6 shrink-0 rounded-full bg-ink text-canvas text-xs flex items-center justify-center font-sans">
						{number}
					</span>
					{title}
				</h2>
				{description && (
					<p className="text-xs text-muted mt-1.5 ml-[34px]">{description}</p>
				)}
			</div>
			<div className="ml-0 sm:ml-[34px] space-y-4">{children}</div>
		</section>
	)
}

/** A small thumbnail with a remove ("×") button — used for both product and
 *  variant image previews so a wrong pick can be undone before saving. */
function ImageThumb({ src, onRemove }: { src: string; onRemove: () => void }) {
	return (
		<div className="relative w-20 h-24 shrink-0">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={src} alt="" className="w-full h-full object-cover border border-line" />
			<button
				type="button"
				onClick={onRemove}
				aria-label="Remove image"
				title="Remove this image"
				className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ink text-canvas text-xs leading-none flex items-center justify-center cursor-pointer hover:bg-danger"
			>
				×
			</button>
		</div>
	)
}

export function ProductForm({
	product,
	categories,
}: {
	product?: Product
	categories: Category[]
}) {
	const router = useRouter()
	const { error: toastError, success } = useToast()
	const isEdit = !!product

	const [title, setTitle] = useState(product?.title ?? '')
	const [category, setCategory] = useState(
		typeof product?.category === 'object' ? product?.category?._id : (product?.category ?? '')
	)
	const [description, setDescription] = useState(product?.description ?? '')
	const [price, setPrice] = useState(product?.price ?? 0)
	const [offer, setOffer] = useState(product?.offer ?? 0)
	const [stock, setStock] = useState(product?.stock ?? 0)
	const [isActive, setIsActive] = useState(product?.isActive ?? true)
	const [existingImages, setExistingImages] = useState(product?.images ?? [])
	const [newImages, setNewImages] = useState<string[]>([])
	const [hasVariants, setHasVariants] = useState(product?.hasVariants ?? false)
	const [variants, setVariants] = useState<VariantDraft[]>(
		(product?.variants ?? []).map(toVariantDraft)
	)
	const [faqs, setFaqs] = useState(product?.faqs ?? [])
	const [dropdowns, setDropdowns] = useState(product?.descriptionDropdowns ?? [])
	const [videoHeading, setVideoHeading] = useState(product?.videoSection?.heading ?? '')
	const [videoNew, setVideoNew] = useState<string | null>(null)
	const [saving, setSaving] = useState(false)

	// The "extra content" section (description tabs / FAQs / video) is
	// optional and most products don't use it — collapse it by default
	// unless there's already something in there to show.
	const [extrasOpen, setExtrasOpen] = useState(
		dropdowns.length > 0 || faqs.length > 0 || !!product?.videoSection?.video?.url
	)

	const addImages = async (files: FileList | null) => {
		if (!files) return
		const encoded = await Promise.all(Array.from(files).map(fileToBase64))
		setNewImages((prev) => [...prev, ...encoded])
	}

	const toggleHasVariants = (next: boolean) => {
		// Turning variants ON hides the single price/stock fields below —
		// warn if the admin already typed something into them so it isn't a
		// surprise. (Nothing is deleted; switching back restores them.)
		if (next && !hasVariants && (price > 0 || stock > 0)) {
			const ok = window.confirm(
				'Switching to "multiple colours / widths" will hide the single Price and Stock you just set — they stay saved but won\'t be used while this is on. Continue?'
			)
			if (!ok) return
		}
		setHasVariants(next)
	}

	const addVariant = () =>
		setVariants((prev) => [
			...prev,
			{ attributes: [{ key: 'Color', value: '' }], price: 0, offer: null, stock: 0, newImages: [], existingImages: [] },
		])

	const updateVariant = (i: number, patch: Partial<VariantDraft>) =>
		setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)))

	const removeVariant = (i: number) =>
		setVariants((prev) => prev.filter((_, idx) => idx !== i))

	const updateVariantAttr = (vi: number, ai: number, patch: Partial<VariantAttribute>) =>
		setVariants((prev) =>
			prev.map((v, idx) =>
				idx !== vi
					? v
					: { ...v, attributes: v.attributes.map((a, j) => (j === ai ? { ...a, ...patch } : a)) }
			)
		)

	const addVariantAttr = (vi: number) =>
		setVariants((prev) =>
			prev.map((v, idx) =>
				idx !== vi ? v : { ...v, attributes: [...v.attributes, { key: '', value: '' }] }
			)
		)

	const removeVariantAttr = (vi: number, ai: number) =>
		setVariants((prev) =>
			prev.map((v, idx) =>
				idx !== vi ? v : { ...v, attributes: v.attributes.filter((_, j) => j !== ai) }
			)
		)

	const addVariantImages = async (vi: number, files: FileList | null) => {
		if (!files) return
		const encoded = await Promise.all(Array.from(files).map(fileToBase64))
		updateVariant(vi, { newImages: [...variants[vi].newImages, ...encoded] })
	}

	const removeVariantNewImage = (vi: number, i: number) =>
		setVariants((prev) =>
			prev.map((v, idx) =>
				idx !== vi ? v : { ...v, newImages: v.newImages.filter((_, j) => j !== i) }
			)
		)

	const removeVariantExistingImage = (vi: number, i: number) =>
		setVariants((prev) =>
			prev.map((v, idx) =>
				idx !== vi ? v : { ...v, existingImages: v.existingImages.filter((_, j) => j !== i) }
			)
		)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!title || !category || !description) {
			toastError('Please fill in the required fields in Basics: title, category and description')
			return
		}
		setSaving(true)
		try {
			const payload: Record<string, unknown> = {
				title,
				// Single-brand store — always Taru Fabrics, nothing for the admin to fill in.
				brand: site.name,
				category,
				description,
				offer,
				isActive,
				hasVariants,
				faqs,
				descriptionDropdowns: dropdowns,
			}

			if (!hasVariants) {
				payload.price = price
				payload.stock = stock
			} else {
				payload.variants = variants.map((v) => ({
					_id: v._id,
					attributes: v.attributes,
					price: v.price,
					offer: v.offer,
					stock: v.stock,
					// Backend uploads any base64 strings and passes through existing {url,key} objects
					images: [...v.existingImages, ...v.newImages],
				}))
			}

			// Images are a full-replace field — only send when the admin actually changed them
			if (newImages.length > 0) {
				payload.images = newImages
			} else if (!isEdit) {
				payload.images = []
			}

			if (videoHeading || videoNew) {
				payload.videoSection = {
					heading: videoHeading,
					video: videoNew ?? product?.videoSection?.video,
				}
			}

			if (isEdit) {
				await api.put(`/api/products/${product._id}`, payload)
				success('Product updated')
			} else {
				await api.post('/api/products', payload)
				success('Product created')
			}
			router.push('/admin/products')
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not save product')
		} finally {
			setSaving(false)
		}
	}

	const extrasCount = dropdowns.length + faqs.length + (videoHeading || videoNew ? 1 : 0)

	return (
		<form onSubmit={submit} className="space-y-6 max-w-3xl">
			<FormSection
				number={1}
				title="Basics"
				description="What customers see first: the name, which category it lives under, and the description."
			>
				<Field label="Title" required hint="The fabric's name as customers will see it, e.g. “Ivory Dutch Satin”.">
					<Input required value={title} onChange={(e) => setTitle(e.target.value)} />
				</Field>
				<Field
					label="Category"
					required
					hint="Which fabric type this belongs to — controls where it shows up in shop filters."
				>
					<select
						required
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						className="w-full h-11 px-3.5 bg-surface border border-line rounded-sm text-sm text-ink focus:outline-none focus:border-accent"
					>
						<option value="">Select a category</option>
						{categories.map((c) => (
							<option key={c._id} value={c._id}>
								{c.name}
							</option>
						))}
					</select>
				</Field>
				<Field label="Description" required hint="A short paragraph about the fabric — its feel, drape and best uses.">
					<Textarea
						required
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={4}
					/>
				</Field>
				<label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
					<input
						type="checkbox"
						checked={isActive}
						onChange={(e) => setIsActive(e.target.checked)}
					/>
					Active — visible on the storefront
				</label>
				<p className="text-xs text-muted -mt-2">
					Uncheck this to keep working on the product without customers seeing it yet.
				</p>
			</FormSection>

			<FormSection
				number={2}
				title="Photos"
				description="The first photo is the cover — it's what shows in the shop grid and search results."
			>
				{(existingImages.length > 0 || newImages.length > 0) && (
					<div className="flex gap-2 flex-wrap">
						{(newImages.length > 0 ? newImages : existingImages.map((i) => i.url)).map(
							(src, i) => (
								<div key={i} className="relative">
									<ImageThumb
										src={src}
										onRemove={() =>
											newImages.length > 0
												? setNewImages((prev) => prev.filter((_, j) => j !== i))
												: setExistingImages((prev) => prev.filter((_, j) => j !== i))
										}
									/>
									{i === 0 && (
										<span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-ink text-canvas text-[0.6rem] uppercase tracking-[0.1em] px-1.5 py-0.5 whitespace-nowrap">
											Cover
										</span>
									)}
								</div>
							)
						)}
					</div>
				)}
				<p className="text-xs text-muted">
					{isEdit
						? 'Uploading new photos replaces all existing photos for this product.'
						: 'Upload one or more photos. Products with no photo show a placeholder.'}
				</p>
				<FileUploadButton
					label="Upload Photos"
					accept="image/*"
					multiple
					onFiles={(files) => {
						addImages(files)
						setExistingImages([])
					}}
				/>
			</FormSection>

			<FormSection
				number={3}
				title="Pricing & Stock"
				description="What it costs per metre, and how much you have on hand."
			>
				<label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
					<input
						type="checkbox"
						checked={hasVariants}
						onChange={(e) => toggleHasVariants(e.target.checked)}
					/>
					This fabric comes in more than one colour or width
				</label>
				<p className="text-xs text-muted -mt-2">
					Turn this on if you sell the same fabric in different colourways or widths, each
					needing its own price, stock and photos. Most products don&apos;t need this.
				</p>

				{!hasVariants ? (
					<div className="grid sm:grid-cols-3 gap-4">
						<Field label="Price (R / metre)" required>
							<Input
								type="number"
								min={0}
								required
								value={price}
								onChange={(e) => setPrice(Number(e.target.value))}
							/>
						</Field>
						<Field label="Offer (%)" hint="Discount shown as a strike-through price. Leave 0 for no offer.">
							<Input
								type="number"
								min={0}
								max={100}
								value={offer}
								onChange={(e) => setOffer(Number(e.target.value))}
							/>
						</Field>
						<Field label="Stock (metres)" required hint="How many metres you currently have available.">
							<Input
								type="number"
								min={0}
								required
								value={stock}
								onChange={(e) => setStock(Number(e.target.value))}
							/>
						</Field>
					</div>
				) : (
					<div className="space-y-5">
						<Field label="Offer (%) — applies to all colours/widths" hint="Leave 0 for no offer.">
							<Input
								type="number"
								min={0}
								max={100}
								value={offer}
								onChange={(e) => setOffer(Number(e.target.value))}
								className="max-w-[160px]"
							/>
						</Field>
						{variants.length === 0 && (
							<p className="text-sm text-muted border border-dashed border-line p-4">
								No colours/widths added yet — use &quot;+ Add Colour / Width&quot; below for
								each one you sell.
							</p>
						)}
						{variants.map((v, vi) => (
							<div key={vi} className="border border-line bg-canvas p-4 space-y-3">
								<div className="flex items-center justify-between">
									<p className="text-xs uppercase tracking-[0.15em] text-muted">
										Colour / Width {vi + 1}
									</p>
									<button
										type="button"
										onClick={() => removeVariant(vi)}
										className="text-xs uppercase tracking-[0.1em] text-danger cursor-pointer"
									>
										Remove
									</button>
								</div>

								<div className="space-y-2">
									{v.attributes.map((a, ai) => (
										<div key={ai} className="flex gap-2">
											<Input
												placeholder="Attribute (e.g. Color)"
												value={a.key}
												onChange={(e) => updateVariantAttr(vi, ai, { key: e.target.value })}
											/>
											<Input
												placeholder="Value (e.g. Indigo)"
												value={a.value}
												onChange={(e) => updateVariantAttr(vi, ai, { value: e.target.value })}
											/>
											<button
												type="button"
												onClick={() => removeVariantAttr(vi, ai)}
												className="px-2 text-muted hover:text-danger cursor-pointer"
												aria-label="Remove attribute"
											>
												×
											</button>
										</div>
									))}
									<button
										type="button"
										onClick={() => addVariantAttr(vi)}
										className="text-xs uppercase tracking-[0.1em] text-accent cursor-pointer"
									>
										+ Attribute
									</button>
								</div>

								<div className="grid sm:grid-cols-2 gap-3">
									<Field label="Price" required>
										<Input
											type="number"
											min={0}
											value={v.price}
											onChange={(e) => updateVariant(vi, { price: Number(e.target.value) })}
										/>
									</Field>
									<Field label="Stock">
										<Input
											type="number"
											min={0}
											value={v.stock}
											onChange={(e) => updateVariant(vi, { stock: Number(e.target.value) })}
										/>
									</Field>
								</div>

								<div>
									<Label>Photos for this colour/width</Label>
									{(v.existingImages.length > 0 || v.newImages.length > 0) && (
										<div className="flex gap-2 mb-2 flex-wrap">
											{v.existingImages.map((img, i) => (
												<ImageThumb
													key={`e${i}`}
													src={img.url}
													onRemove={() => removeVariantExistingImage(vi, i)}
												/>
											))}
											{v.newImages.map((src, i) => (
												<ImageThumb
													key={`n${i}`}
													src={src}
													onRemove={() => removeVariantNewImage(vi, i)}
												/>
											))}
										</div>
									)}
									<FileUploadButton
										label="Upload Photos"
										accept="image/*"
										multiple
										onFiles={(files) => addVariantImages(vi, files)}
									/>
								</div>
							</div>
						))}
						<button
							type="button"
							onClick={addVariant}
							className="text-xs uppercase tracking-[0.15em] text-accent link-underline cursor-pointer"
						>
							+ Add Colour / Width
						</button>
					</div>
				)}
			</FormSection>

			{/* Optional extras — collapsed by default so a simple product doesn't
			    force a scroll past three sections it doesn't need. */}
			<section className="border border-line bg-surface">
				<button
					type="button"
					onClick={() => setExtrasOpen((o) => !o)}
					className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
				>
					<div>
						<h2 className="font-display text-xl text-ink">
							Extra Content{' '}
							<span className="text-sm text-muted font-sans">(optional)</span>
						</h2>
						<p className="text-xs text-muted mt-1.5">
							Extra tabs on the product page — sizing/care notes, FAQs, a video.
							{extrasCount > 0 && ` ${extrasCount} added.`} Most products skip this.
						</p>
					</div>
					<span className="text-lg text-muted shrink-0 ml-4">{extrasOpen ? '−' : '+'}</span>
				</button>

				{extrasOpen && (
					<div className="px-6 pb-6 space-y-8 border-t border-line pt-6">
						<div className="space-y-3">
							<div>
								<h3 className="text-sm text-ink uppercase tracking-[0.1em]">
									Description Sections
								</h3>
								<p className="text-xs text-muted mt-1">
									Expandable tabs under the description, e.g. &quot;Care Instructions&quot;
									or &quot;Fabric Details&quot;.
								</p>
							</div>
							{dropdowns.map((d, i) => (
								<div key={i} className="border border-line bg-canvas p-4 space-y-2">
									<div className="flex gap-2">
										<Input
											placeholder="Heading, e.g. Care Instructions"
											value={d.heading}
											onChange={(e) =>
												setDropdowns((prev) =>
													prev.map((x, j) => (j === i ? { ...x, heading: e.target.value } : x))
												)
											}
										/>
										<button
											type="button"
											onClick={() => setDropdowns((prev) => prev.filter((_, j) => j !== i))}
											className="px-2 text-muted hover:text-danger cursor-pointer"
											aria-label="Remove section"
										>
											×
										</button>
									</div>
									<Textarea
										placeholder="Content"
										rows={2}
										value={d.content}
										onChange={(e) =>
											setDropdowns((prev) =>
												prev.map((x, j) => (j === i ? { ...x, content: e.target.value } : x))
											)
										}
									/>
								</div>
							))}
							<button
								type="button"
								onClick={() => setDropdowns((prev) => [...prev, { heading: '', content: '' }])}
								className="text-xs uppercase tracking-[0.15em] text-accent link-underline cursor-pointer"
							>
								+ Add Section
							</button>
						</div>

						<div className="space-y-3">
							<div>
								<h3 className="text-sm text-ink uppercase tracking-[0.1em]">FAQs</h3>
								<p className="text-xs text-muted mt-1">
									Common questions shown under &quot;Questions &amp; Answers&quot; on the
									product page.
								</p>
							</div>
							{faqs.map((f, i) => (
								<div key={i} className="border border-line bg-canvas p-4 space-y-2">
									<div className="flex gap-2">
										<Input
											placeholder="Question"
											value={f.question}
											onChange={(e) =>
												setFaqs((prev) =>
													prev.map((x, j) => (j === i ? { ...x, question: e.target.value } : x))
												)
											}
										/>
										<button
											type="button"
											onClick={() => setFaqs((prev) => prev.filter((_, j) => j !== i))}
											className="px-2 text-muted hover:text-danger cursor-pointer"
											aria-label="Remove FAQ"
										>
											×
										</button>
									</div>
									<Textarea
										placeholder="Answer"
										rows={2}
										value={f.answer}
										onChange={(e) =>
											setFaqs((prev) =>
												prev.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x))
											)
										}
									/>
								</div>
							))}
							<button
								type="button"
								onClick={() => setFaqs((prev) => [...prev, { question: '', answer: '' }])}
								className="text-xs uppercase tracking-[0.15em] text-accent link-underline cursor-pointer"
							>
								+ Add FAQ
							</button>
						</div>

						<div className="space-y-3">
							<div>
								<h3 className="text-sm text-ink uppercase tracking-[0.1em]">Video</h3>
								<p className="text-xs text-muted mt-1">
									A short clip shown on the product page — e.g. the fabric draping or
									catching the light.
								</p>
							</div>
							<Field label="Heading">
								<Input value={videoHeading} onChange={(e) => setVideoHeading(e.target.value)} />
							</Field>
							<div>
								<Label>Video File</Label>
								{product?.videoSection?.video?.url && !videoNew && (
									<p className="text-xs text-muted mb-2">
										A video is already set — upload a file to replace it.
									</p>
								)}
								<FileUploadButton
									label="Upload Video"
									accept="video/*"
									onFiles={async (files) => {
										const file = files?.[0]
										if (file) setVideoNew(await fileToBase64(file))
									}}
								/>
							</div>
						</div>
					</div>
				)}
			</section>

			<div className="flex gap-3 pt-4 border-t border-line">
				<Button type="submit" loading={saving} size="lg">
					{isEdit ? 'Save Changes' : 'Create Product'}
				</Button>
				<ButtonLink href="/admin/products" variant="ghost" size="lg">
					Cancel
				</ButtonLink>
			</div>
		</form>
	)
}
