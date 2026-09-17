'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Button, ButtonLink } from '@/components/ui/Button'

export default function Error({
	error,
	unstable_retry,
}: {
	error: Error & { digest?: string }
	unstable_retry: () => void
}) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
			<Image
				src="/karoo/wool.jpg"
				alt=""
				fill
				sizes="100vw"
				className="object-cover"
			/>
			<div className="absolute inset-0 bg-ink/80" />
			<div className="relative container-page text-center py-20">
				<p className="eyebrow mb-4 text-white/60">Something Went Wrong</p>
				<h1 className="font-display text-5xl md:text-7xl text-white leading-[0.98]">
					A thread came loose
				</h1>
				<p className="mt-6 text-white/75 max-w-md mx-auto leading-relaxed">
					We hit an unexpected snag loading this page. Please try again, or
					head back home.
				</p>
				<div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
					<Button
						onClick={() => unstable_retry()}
						size="lg"
						className="!bg-white !text-ink !border-white hover:!bg-white/90"
					>
						Try Again
					</Button>
					<ButtonLink
						href="/"
						variant="outline"
						size="lg"
						className="!border-white !text-white hover:!bg-white hover:!text-ink"
					>
						Back to Home
					</ButtonLink>
				</div>
			</div>
		</div>
	)
}
