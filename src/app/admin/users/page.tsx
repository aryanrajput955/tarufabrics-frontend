'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/admin/Badge'
import { AdminPageHeader } from '@/components/admin/PageHeader'
import type { User } from '@/lib/types'

export default function AdminUsersPage() {
	const { user: currentUser } = useAuth()
	const { error: toastError, success } = useToast()
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [busyId, setBusyId] = useState<string | null>(null)

	useEffect(() => {
		api
			.get<{ users: User[] }>('/api/auth/users')
			.then((res) => setUsers(res.data?.users ?? []))
			.catch((e) => toastError(e instanceof Error ? e.message : 'Could not load users'))
			.finally(() => setLoading(false))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const toggleRole = async (u: User) => {
		const nextRole = u.role === 'admin' ? 'user' : 'admin'
		if (
			!window.confirm(
				nextRole === 'admin'
					? `Make ${u.name || u.email} an admin? They will get full access to this panel.`
					: `Remove admin access from ${u.name || u.email}?`
			)
		)
			return
		setBusyId(u.id)
		try {
			await api.patch(`/api/auth/users/${u.id}/role`, { role: nextRole })
			setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: nextRole } : x)))
			success(`${u.name || u.email} is now ${nextRole === 'admin' ? 'an admin' : 'a customer'}`)
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Could not update role')
		} finally {
			setBusyId(null)
		}
	}

	return (
		<div>
			<AdminPageHeader
				eyebrow="Accounts"
				title="Users"
				description="Everyone with an account on the storefront. Making someone an admin gives them this exact panel — the same access you have."
			/>

			{loading ? (
				<p className="text-muted text-sm">Loading…</p>
			) : users.length === 0 ? (
				<p className="text-muted text-sm border border-line bg-surface p-6">No users yet.</p>
			) : (
				<div className="border border-line bg-surface overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-line text-left text-xs uppercase tracking-[0.1em] text-muted">
								<th className="px-5 py-3 font-normal">Name</th>
								<th className="px-5 py-3 font-normal">Email</th>
								<th className="px-5 py-3 font-normal">Phone</th>
								<th className="px-5 py-3 font-normal">Role</th>
								<th className="px-5 py-3 font-normal text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{users.map((u) => {
								const isSelf = u.id === currentUser?.id
								const busy = busyId === u.id
								return (
									<tr
										key={u.id}
										className={`border-b border-line last:border-0 ${busy ? 'opacity-50' : ''}`}
									>
										<td className="px-5 py-3 text-ink">{u.name || '—'}</td>
										<td className="px-5 py-3 text-ink-soft">{u.email}</td>
										<td className="px-5 py-3 text-ink-soft">{u.phone || '—'}</td>
										<td className="px-5 py-3">
											<Badge status={u.role} />
										</td>
										<td className="px-5 py-3 text-right">
											{isSelf ? (
												<span className="text-xs text-muted">You</span>
											) : (
												<button
													onClick={() => toggleRole(u)}
													disabled={busy}
													className="text-xs uppercase tracking-[0.15em] text-accent link-underline cursor-pointer disabled:opacity-50"
												>
													{u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
												</button>
											)}
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}
