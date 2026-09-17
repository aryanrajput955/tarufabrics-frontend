'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { User } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { Field, Input } from '@/components/ui/Field'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { PasswordRequirements } from '@/components/auth/PasswordRequirements'
import { Button } from '@/components/ui/Button'
import { isPasswordValid } from '@/lib/password'

export default function ProfilePage() {
	const { user, setUser } = useAuth()
	const { success, error: toastError } = useToast()

	const [name, setName] = useState('')
	const [phone, setPhone] = useState('')
	const [savingInfo, setSavingInfo] = useState(false)

	const [oldPassword, setOldPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmNewPassword, setConfirmNewPassword] = useState('')
	const [savingPw, setSavingPw] = useState(false)
	const [pwError, setPwError] = useState<string | null>(null)

	useEffect(() => {
		if (user) {
			setName(user.name === 'User' ? '' : user.name || '')
			setPhone(user.phone || '')
		}
	}, [user])

	const saveInfo = async (e: React.FormEvent) => {
		e.preventDefault()
		setSavingInfo(true)
		try {
			const res = await api.put<{ user: User }>('/api/auth/profile', {
				name,
				phone,
			})
			if (res.data?.user) setUser(res.data.user)
			success('Profile updated')
		} catch (err) {
			toastError(err instanceof Error ? err.message : 'Could not update profile')
		} finally {
			setSavingInfo(false)
		}
	}

	const changePassword = async (e: React.FormEvent) => {
		e.preventDefault()
		setPwError(null)
		if (!isPasswordValid(newPassword)) {
			setPwError('Please meet all password requirements below')
			return
		}
		if (newPassword !== confirmNewPassword) {
			setPwError('Passwords do not match')
			return
		}
		setSavingPw(true)
		try {
			await api.put('/api/auth/profile', { oldPassword, newPassword })
			success('Password changed')
			setOldPassword('')
			setNewPassword('')
			setConfirmNewPassword('')
		} catch (err) {
			toastError(err instanceof Error ? err.message : 'Could not change password')
		} finally {
			setSavingPw(false)
		}
	}

	if (!user) return null

	return (
		<div className="max-w-lg">
			<p className="eyebrow mb-2">Account Settings</p>
			<h1 className="font-display text-3xl md:text-4xl text-ink mb-8">Profile</h1>

			<form
				onSubmit={saveInfo}
				className="border border-line rounded-sm p-6 bg-surface space-y-4"
			>
				<p className="eyebrow">Personal Details</p>
				<Field label="Email">
					<Input value={user.email} disabled className="opacity-60" />
				</Field>
				<Field label="Full Name">
					<Input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Your name"
					/>
				</Field>
				<Field label="Phone">
					<Input
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder="10-digit number"
					/>
				</Field>
				<Button type="submit" loading={savingInfo}>
					Save Changes
				</Button>
			</form>

			<form
				onSubmit={changePassword}
				className="border border-line rounded-sm p-6 bg-surface space-y-4 mt-6"
			>
				<p className="eyebrow">Change Password</p>
				<Field label="Current Password">
					<PasswordInput
						required
						value={oldPassword}
						onChange={(e) => setOldPassword(e.target.value)}
						autoComplete="current-password"
					/>
				</Field>
				<Field label="New Password">
					<PasswordInput
						required
						minLength={8}
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						placeholder="Create a new password"
						autoComplete="new-password"
					/>
					<PasswordRequirements password={newPassword} />
				</Field>
				<Field label="Re-enter New Password">
					<PasswordInput
						required
						value={confirmNewPassword}
						onChange={(e) => setConfirmNewPassword(e.target.value)}
						placeholder="Re-enter your new password"
						autoComplete="new-password"
					/>
					{confirmNewPassword.length > 0 && confirmNewPassword !== newPassword && (
						<p className="mt-1.5 text-xs text-danger">Passwords do not match</p>
					)}
				</Field>
				{pwError && <p className="text-sm text-danger">{pwError}</p>}
				<Button type="submit" loading={savingPw}>
					Update Password
				</Button>
			</form>
		</div>
	)
}
