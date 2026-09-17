'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { AuthShell } from '@/components/auth/AuthShell'
import { Field, Input } from '@/components/ui/Field'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { PasswordRequirements } from '@/components/auth/PasswordRequirements'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { isPasswordValid } from '@/lib/password'

export default function ForgotPasswordPage() {
	const router = useRouter()
	const { success } = useToast()

	const [step, setStep] = useState<1 | 2 | 3>(1)
	const [email, setEmail] = useState('')
	const [otp, setOtp] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const sendOtp = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)
		try {
			await api.post('/api/auth/forgot-password/send-otp', { email })
			success('Reset code sent to your email')
			setStep(2)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not send code')
		} finally {
			setLoading(false)
		}
	}

	const verifyOtp = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)
		try {
			await api.post('/api/auth/forgot-password/verify-otp', { email, otp })
			setStep(3)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Invalid code')
		} finally {
			setLoading(false)
		}
	}

	const reset = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		if (!isPasswordValid(password)) {
			setError('Please meet all password requirements below')
			return
		}
		if (password !== confirmPassword) {
			setError('Passwords do not match')
			return
		}
		setLoading(true)
		try {
			await api.post('/api/auth/forgot-password/reset', { email, otp, password })
			success('Password updated. Please sign in.')
			router.push('/login')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not reset password')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthShell
			title="Reset Password"
			subtitle={
				step === 1
					? 'Enter your email to receive a reset code'
					: step === 2
					? `Enter the code sent to ${email}`
					: 'Choose a new password'
			}
			image="/karoo/wool.jpg"
			footer={
				<Link href="/login" className="text-accent link-underline">
					Back to sign in
				</Link>
			}
		>
			{step === 1 && (
				<form onSubmit={sendOtp} className="space-y-5">
					<Field label="Email" htmlFor="email">
						<Input
							id="email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
						/>
					</Field>
					{error && <p className="text-sm text-danger">{error}</p>}
					<Button type="submit" loading={loading} className="w-full" size="lg">
						Send Reset Code
					</Button>
				</form>
			)}

			{step === 2 && (
				<form onSubmit={verifyOtp} className="space-y-5">
					<Field label="Reset Code" htmlFor="otp">
						<Input
							id="otp"
							inputMode="numeric"
							required
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							placeholder="6-digit code"
						/>
					</Field>
					{error && <p className="text-sm text-danger">{error}</p>}
					<Button type="submit" loading={loading} className="w-full" size="lg">
						Verify Code
					</Button>
				</form>
			)}

			{step === 3 && (
				<form onSubmit={reset} className="space-y-5">
					<Field label="New Password" htmlFor="password">
						<PasswordInput
							id="password"
							required
							minLength={8}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Create a new password"
							autoComplete="new-password"
						/>
						<PasswordRequirements password={password} />
					</Field>
					<Field label="Re-enter Password" htmlFor="confirmPassword">
						<PasswordInput
							id="confirmPassword"
							required
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Re-enter your new password"
							autoComplete="new-password"
						/>
						{confirmPassword.length > 0 && confirmPassword !== password && (
							<p className="mt-1.5 text-xs text-danger">Passwords do not match</p>
						)}
					</Field>
					{error && <p className="text-sm text-danger">{error}</p>}
					<Button type="submit" loading={loading} className="w-full" size="lg">
						Update Password
					</Button>
				</form>
			)}
		</AuthShell>
	)
}
