'use client'

import { useState, type ComponentProps } from 'react'
import { Input } from './Field'

/** A password <Input> with a show/hide eye toggle. */
export function PasswordInput({
	className,
	...props
}: Omit<ComponentProps<'input'>, 'type'>) {
	const [visible, setVisible] = useState(false)

	return (
		<div className="relative">
			<Input
				type={visible ? 'text' : 'password'}
				className={['pr-11', className].filter(Boolean).join(' ')}
				{...props}
			/>
			<button
				type="button"
				onClick={() => setVisible((v) => !v)}
				aria-label={visible ? 'Hide password' : 'Show password'}
				aria-pressed={visible}
				className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted hover:text-ink cursor-pointer"
			>
				{visible ? (
					<svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
						<path d="M3 3l18 18" strokeLinecap="round" />
						<path
							d="M10.6 5.1A10.9 10.9 0 0 1 12 5c5.5 0 9 5 9.7 7a11.9 11.9 0 0 1-3 4.1M6.6 6.6C3.7 8.4 2 11 2 12c.6 1.8 3.4 6 8.6 7 1 .2 2 .2 2.9.1"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path d="M9.9 10a3 3 0 0 0 4.1 4.1" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				) : (
					<svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
						<path
							d="M2 12c.7-2 4.2-7 10-7s9.3 5 10 7c-.7 2-4.2 7-10 7s-9.3-5-10-7Z"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<circle cx="12" cy="12" r="3" />
					</svg>
				)}
			</button>
		</div>
	)
}
