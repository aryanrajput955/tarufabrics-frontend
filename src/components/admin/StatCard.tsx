export function StatCard({
	label,
	value,
	hint,
}: {
	label: string
	value: string | number
	hint?: string
}) {
	return (
		<div className="border border-line bg-surface p-6">
			<p className="text-xs uppercase tracking-[0.15em] text-muted">{label}</p>
			<p className="font-display text-3xl text-ink mt-2">{value}</p>
			{hint && <p className="text-xs text-muted mt-1">{hint}</p>}
		</div>
	)
}
