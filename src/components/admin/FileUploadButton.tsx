'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/Button'

/**
 * A styled upload button that triggers a hidden native file input — used
 * instead of a bare <input type="file"> so every upload control in the admin
 * panel looks and behaves like the rest of the UI (and reliably shows a
 * pointer cursor, which the native "Choose File" control doesn't everywhere).
 */
export function FileUploadButton({
	label,
	accept,
	multiple,
	onFiles,
	size = 'sm',
	variant = 'outline',
	className,
}: {
	label: string
	accept: string
	multiple?: boolean
	onFiles: (files: FileList | null) => void
	size?: 'sm' | 'md' | 'lg'
	variant?: 'primary' | 'outline' | 'ghost'
	className?: string
}) {
	const inputRef = useRef<HTMLInputElement>(null)

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				accept={accept}
				multiple={multiple}
				onChange={(e) => {
					onFiles(e.target.files)
					// Reset so picking the same file again (e.g. after removing it)
					// still fires onChange.
					e.target.value = ''
				}}
				className="hidden"
			/>
			<Button
				type="button"
				variant={variant}
				size={size}
				onClick={() => inputRef.current?.click()}
				className={className}
			>
				{label}
			</Button>
		</>
	)
}
