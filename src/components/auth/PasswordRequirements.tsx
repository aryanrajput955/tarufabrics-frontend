import { PASSWORD_REQUIREMENTS } from '@/lib/password'

/** Live checklist shown under a new-password field — ticks off as the admin/
 *  customer types, instead of only finding out what's wrong after submit. */
export function PasswordRequirements({ password }: { password: string }) {
	return (
		<ul className="mt-2 space-y-1">
			{PASSWORD_REQUIREMENTS.map((r) => {
				const met = r.test(password)
				return (
					<li
						key={r.key}
						className={`flex items-center gap-1.5 text-xs transition-colors ${
							met ? 'text-success' : 'text-muted'
						}`}
					>
						<svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
							{met ? (
								<path d="M4 12.5 9.5 18 20 6.5" strokeLinecap="round" strokeLinejoin="round" />
							) : (
								<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
							)}
						</svg>
						{r.label}
					</li>
				)
			})}
		</ul>
	)
}
