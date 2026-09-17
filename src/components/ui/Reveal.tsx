'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Fades + lifts children into view once when scrolled into the viewport.
 * No-ops instantly (no transition) when the user prefers reduced motion.
 */
export function Reveal({
	children,
	className = '',
	delay = 0,
	as: Tag = 'div',
}: {
	children: ReactNode
	className?: string
	delay?: number
	as?: 'div' | 'li' | 'span'
}) {
	const ref = useRef<HTMLDivElement>(null)
	const [visible, setVisible] = useState(false)
	const [reduceMotion, setReduceMotion] = useState(false)

	useEffect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
		setReduceMotion(mq.matches)
		if (mq.matches) {
			setVisible(true)
			return
		}

		const el = ref.current
		if (!el) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true)
					observer.disconnect()
				}
			},
			{ threshold: 0.15 }
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	return (
		<Tag
			ref={ref as never}
			className={`${reduceMotion ? '' : 'transition-[opacity,transform] duration-700 ease-out'} ${
				visible ? 'opacity-100 translate-y-0' : reduceMotion ? '' : 'opacity-0 translate-y-6'
			} ${className}`}
			style={!reduceMotion ? { transitionDelay: `${delay}ms` } : undefined}
		>
			{children}
		</Tag>
	)
}
