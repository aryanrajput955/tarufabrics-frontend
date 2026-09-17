import type { ComponentProps, ReactNode } from 'react'

const inputBase =
	'w-full h-11 px-3.5 bg-surface border border-line rounded-sm text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent transition-colors'

export function Label({
	children,
	htmlFor,
	required,
}: {
	children: ReactNode
	htmlFor?: string
	required?: boolean
}) {
	return (
		<label
			htmlFor={htmlFor}
			className="block text-xs uppercase tracking-[0.15em] text-ink-soft mb-2"
		>
			{children}
			{required && <span className="text-danger ml-0.5">*</span>}
		</label>
	)
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
	return <input className={[inputBase, className].filter(Boolean).join(' ')} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
	return (
		<textarea
			className={[
				inputBase,
				'h-auto py-3 resize-y min-h-28',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			{...props}
		/>
	)
}

export function Field({
	label,
	htmlFor,
	error,
	hint,
	required,
	children,
}: {
	label?: string
	htmlFor?: string
	error?: string
	/** Short plain-English explanation shown under the input — use for anything
	 *  whose purpose or effect isn't obvious from the label alone. */
	hint?: string
	required?: boolean
	children: ReactNode
}) {
	return (
		<div>
			{label && (
				<Label htmlFor={htmlFor} required={required}>
					{label}
				</Label>
			)}
			{children}
			{hint && !error && <p className="mt-1.5 text-xs text-muted leading-relaxed">{hint}</p>}
			{error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
		</div>
	)
}
