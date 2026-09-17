const STATUS_STYLES: Record<string, string> = {
	processing: 'bg-accent-soft text-accent-dark',
	shipped: 'bg-accent-soft text-accent-dark',
	delivered: 'bg-success/10 text-success',
	cancelled: 'bg-danger/10 text-danger',
	active: 'bg-success/10 text-success',
	inactive: 'bg-muted/10 text-muted',
	admin: 'bg-accent-soft text-accent-dark',
	user: 'bg-muted/10 text-muted',
}

export function Badge({ status }: { status: string }) {
	const style = STATUS_STYLES[status] || 'bg-muted/10 text-muted'
	return (
		<span
			className={`inline-block px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.1em] rounded-sm ${style}`}
		>
			{status}
		</span>
	)
}
