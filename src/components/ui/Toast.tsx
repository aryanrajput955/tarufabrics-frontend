'use client'

import {
	createContext,
	useCallback,
	useContext,
	useState,
	type ReactNode,
} from 'react'

type ToastKind = 'success' | 'error' | 'info'
interface Toast {
	id: number
	kind: ToastKind
	message: string
}

interface ToastContextValue {
	toast: (message: string, kind?: ToastKind) => void
	success: (message: string) => void
	error: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([])

	const remove = useCallback((id: number) => {
		setToasts((t) => t.filter((x) => x.id !== id))
	}, [])

	const toast = useCallback(
		(message: string, kind: ToastKind = 'info') => {
			const id = Date.now() + Math.random()
			setToasts((t) => [...t, { id, kind, message }])
			setTimeout(() => remove(id), 4000)
		},
		[remove]
	)

	const value: ToastContextValue = {
		toast,
		success: (m) => toast(m, 'success'),
		error: (m) => toast(m, 'error'),
	}

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
				{toasts.map((t) => (
					<button
						key={t.id}
						onClick={() => remove(t.id)}
						className={[
							'text-left px-4 py-3 rounded-sm shadow-lg border text-sm animate-[fadeIn_0.2s_ease] bg-surface',
							t.kind === 'success' && 'border-success text-success',
							t.kind === 'error' && 'border-danger text-danger',
							t.kind === 'info' && 'border-line text-ink',
						]
							.filter(Boolean)
							.join(' ')}
					>
						{t.message}
					</button>
				))}
			</div>
		</ToastContext.Provider>
	)
}

export function useToast() {
	const ctx = useContext(ToastContext)
	if (!ctx) throw new Error('useToast must be used within a ToastProvider')
	return ctx
}
