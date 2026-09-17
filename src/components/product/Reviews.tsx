'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { Review } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { StarRating, StarRatingInput } from './StarRating'

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('en-ZA', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}

export function Reviews({
	productId,
	ratings,
	reviewCount,
	onSummaryChange,
}: {
	productId: string
	ratings: number
	reviewCount: number
	onSummaryChange?: (summary: { ratings: number; reviewCount: number }) => void
}) {
	const router = useRouter()
	const { user } = useAuth()
	const { success, error: toastError } = useToast()

	const [reviews, setReviews] = useState<Review[]>([])
	const [loading, setLoading] = useState(true)
	const [myReview, setMyReview] = useState<Review | null>(null)
	const [editing, setEditing] = useState(false)
	const [rating, setRating] = useState(5)
	const [comment, setComment] = useState('')
	const [submitting, setSubmitting] = useState(false)

	const loadReviews = () => {
		setLoading(true)
		api
			.get<Review[]>(`/api/reviews/product/${productId}`)
			.then((res) => setReviews(res.data ?? []))
			.finally(() => setLoading(false))
	}

	useEffect(() => {
		loadReviews()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [productId])

	useEffect(() => {
		if (!user) {
			setMyReview(null)
			return
		}
		api
			.get<Review | null>(`/api/reviews/product/${productId}/mine`)
			.then((res) => {
				const mine = res.data ?? null
				setMyReview(mine)
				if (mine) {
					setRating(mine.rating)
					setComment(mine.comment)
				}
			})
			.catch(() => {})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [productId, user])

	const startWrite = () => {
		if (!user) {
			router.push(`/login?redirect=/product/${productId}`)
			return
		}
		setEditing(true)
	}

	const submit = async () => {
		if (!comment.trim()) {
			toastError('Please write a comment')
			return
		}
		setSubmitting(true)
		try {
			const res = myReview
				? await api.put(`/api/reviews/${productId}`, { rating, comment })
				: await api.post(`/api/reviews/${productId}`, { rating, comment })
			success(myReview ? 'Review updated' : 'Review submitted')
			const summary = res.productSummary as
				| { ratings: number; reviewCount: number }
				| undefined
			if (summary) onSummaryChange?.(summary)
			setEditing(false)
			loadReviews()
			const mineRes = await api.get<Review | null>(`/api/reviews/product/${productId}/mine`)
			setMyReview(mineRes.data ?? null)
		} catch (e) {
			toastError(e instanceof ApiError ? e.message : 'Could not submit review')
		} finally {
			setSubmitting(false)
		}
	}

	const remove = async () => {
		setSubmitting(true)
		try {
			const res = await api.del(`/api/reviews/${productId}`)
			success('Review removed')
			const summary = res.productSummary as
				| { ratings: number; reviewCount: number }
				| undefined
			if (summary) onSummaryChange?.(summary)
			setMyReview(null)
			setEditing(false)
			setRating(5)
			setComment('')
			loadReviews()
		} catch (e) {
			toastError(e instanceof ApiError ? e.message : 'Could not remove review')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div id="reviews" className="mt-14 border-t border-line pt-10 scroll-mt-24">
			<div className="flex flex-wrap items-center justify-between gap-4 mb-8">
				<div>
					<h2 className="font-display text-2xl text-ink mb-2">Reviews</h2>
					{reviewCount > 0 ? (
						<div className="flex items-center gap-2.5">
							<StarRating value={ratings} size={16} />
							<span className="text-sm text-ink-soft">
								{ratings.toFixed(1)} · {reviewCount} review
								{reviewCount === 1 ? '' : 's'}
							</span>
						</div>
					) : (
						<p className="text-sm text-muted">No reviews yet — be the first.</p>
					)}
				</div>
				{!editing && !myReview && (
					<Button variant="outline" onClick={startWrite}>
						Write a Review
					</Button>
				)}
			</div>

			{editing && (
				<div className="border border-line bg-surface p-6 mb-8">
					<p className="text-xs uppercase tracking-[0.15em] text-ink-soft mb-2">
						Your Rating
					</p>
					<StarRatingInput value={rating} onChange={setRating} />
					<p className="text-xs uppercase tracking-[0.15em] text-ink-soft mt-5 mb-2">
						Your Review
					</p>
					<textarea
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						rows={4}
						maxLength={1000}
						placeholder="Share your thoughts on this fabric's texture, drape, and quality..."
						className="w-full border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink resize-none"
					/>
					<div className="mt-4 flex items-center gap-3">
						<Button onClick={submit} loading={submitting}>
							{myReview ? 'Update Review' : 'Submit Review'}
						</Button>
						<Button
							variant="ghost"
							onClick={() => {
								setEditing(false)
								if (myReview) {
									setRating(myReview.rating)
									setComment(myReview.comment)
								}
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{myReview && !editing && (
				<div className="border border-line bg-surface p-6 mb-8">
					<div className="flex items-center justify-between mb-1">
						<p className="text-xs uppercase tracking-[0.15em] text-accent-dark">
							Your Review
						</p>
						<div className="flex items-center gap-4 text-xs uppercase tracking-[0.1em]">
							<button
								onClick={() => setEditing(true)}
								className="text-ink-soft hover:text-ink cursor-pointer"
							>
								Edit
							</button>
							<button
								onClick={remove}
								disabled={submitting}
								className="text-danger hover:opacity-70 cursor-pointer disabled:opacity-40"
							>
								Delete
							</button>
						</div>
					</div>
					<StarRating value={myReview.rating} size={14} className="mb-2" />
					<p className="text-sm text-ink-soft leading-relaxed">{myReview.comment}</p>
				</div>
			)}

			{loading ? (
				<div className="space-y-6 animate-pulse">
					{[0, 1].map((i) => (
						<div key={i} className="h-20 bg-line/40" />
					))}
				</div>
			) : reviews.filter((r) => r._id !== myReview?._id).length === 0 &&
			  !myReview ? null : (
				<div className="space-y-6">
					{reviews
						.filter((r) => r._id !== myReview?._id)
						.map((r) => {
							const name =
								typeof r.user === 'object' && r.user ? r.user.name : 'Anonymous'
							return (
								<div key={r._id} className="border-b border-line pb-6">
									<div className="flex items-center justify-between mb-1.5">
										<div className="flex items-center gap-3">
											<StarRating value={r.rating} size={14} />
											<span className="text-sm text-ink">{name}</span>
											{r.verifiedPurchase && (
												<span className="text-[0.6rem] uppercase tracking-[0.12em] text-success border border-success px-1.5 py-0.5">
													Verified Purchase
												</span>
											)}
										</div>
										<span className="text-xs text-muted">
											{formatDate(r.createdAt)}
										</span>
									</div>
									<p className="text-sm text-ink-soft leading-relaxed">{r.comment}</p>
								</div>
							)
						})}
				</div>
			)}
		</div>
	)
}
