'use client'

import { useEffect, useRef, useState } from 'react'

export interface SortOption<T extends string> {
	value: T
	label: string
}

export function SortSelect<T extends string>({
	value,
	options,
	onChange,
}: {
	value: T
	options: SortOption<T>[]
	onChange: (value: T) => void
}) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		const onDoc = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false)
		}
		document.addEventListener('mousedown', onDoc)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('mousedown', onDoc)
			document.removeEventListener('keydown', onKey)
		}
	}, [open])

	const current = options.find((o) => o.value === value)

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				aria-haspopup="listbox"
				aria-expanded={open}
				className="flex items-center gap-2.5 h-9 pl-3.5 pr-3 border border-line hover:border-ink transition-colors text-xs uppercase tracking-[0.14em] text-ink cursor-pointer bg-surface"
			>
				<span className="text-muted hidden md:inline">Sort</span>
				<span>{current?.label}</span>
				<svg
					width="10"
					height="10"
					viewBox="0 0 10 10"
					className={`text-muted transition-transform duration-200 ${
						open ? 'rotate-180' : ''
					}`}
					fill="none"
					stroke="currentColor"
					strokeWidth="1.3"
				>
					<path d="M2 3.5 5 6.5 8 3.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</button>

			{open && (
				<ul
					role="listbox"
					className="absolute right-0 top-full mt-1.5 min-w-52 bg-surface border border-line shadow-lg z-50 py-1 animate-[fadeIn_0.15s_ease]"
				>
					{options.map((o) => {
						const active = o.value === value
						return (
							<li key={o.value} role="option" aria-selected={active}>
								<button
									type="button"
									onClick={() => {
										onChange(o.value)
										setOpen(false)
									}}
									className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-[0.12em] flex items-center justify-between transition-colors cursor-pointer ${
										active
											? 'text-ink bg-accent-soft/60'
											: 'text-ink-soft hover:bg-accent-soft/40 hover:text-ink'
									}`}
								>
									{o.label}
									{active && (
										<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-accent">
											<path d="M2.5 6.5 5 9l4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									)}
								</button>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}
