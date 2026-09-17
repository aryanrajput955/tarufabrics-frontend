function Star({ filled, half }: { filled: boolean; half?: boolean }) {
	return (
		<svg viewBox="0 0 20 20" className="w-full h-full">
			<defs>
				<linearGradient id="star-half" x1="0" x2="100%" y1="0" y2="0">
					<stop offset="50%" stopColor="currentColor" />
					<stop offset="50%" stopColor="transparent" />
				</linearGradient>
			</defs>
			<path
				d="M10 1.5l2.59 5.25 5.79.84-4.19 4.08.99 5.77L10 14.77l-5.18 2.67.99-5.77-4.19-4.08 5.79-.84L10 1.5z"
				fill={half ? 'url(#star-half)' : filled ? 'currentColor' : 'none'}
				stroke="currentColor"
				strokeWidth="1"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export function StarRating({
	value,
	size = 16,
	className = '',
}: {
	value: number
	size?: number
	className?: string
}) {
	return (
		<div
			className={`flex items-center gap-0.5 text-accent ${className}`}
			style={{ width: size * 5 + 4 * 2 }}
		>
			{[1, 2, 3, 4, 5].map((i) => (
				<span key={i} style={{ width: size, height: size }}>
					<Star filled={value >= i} half={value < i && value > i - 1} />
				</span>
			))}
		</div>
	)
}

export function StarRatingInput({
	value,
	onChange,
	size = 24,
}: {
	value: number
	onChange: (v: number) => void
	size?: number
}) {
	return (
		<div className="flex items-center gap-1 text-accent">
			{[1, 2, 3, 4, 5].map((i) => (
				<button
					key={i}
					type="button"
					onClick={() => onChange(i)}
					className="cursor-pointer transition-transform hover:scale-110"
					style={{ width: size, height: size }}
					aria-label={`${i} star${i > 1 ? 's' : ''}`}
				>
					<Star filled={value >= i} />
				</button>
			))}
		</div>
	)
}
