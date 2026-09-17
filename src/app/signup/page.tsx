'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { AuthShell } from '@/components/auth/AuthShell'
import { Field, Input } from '@/components/ui/Field'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { PasswordRequirements } from '@/components/auth/PasswordRequirements'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { isPasswordValid } from '@/lib/password'

export default function SignupPage() {
	const { signup } = useAuth()
	const router = useRouter()
	const { success } = useToast()

	const [step, setStep] = useState<1 | 2>(1)
	const [email, setEmail] = useState('')
	const [phone, setPhone] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [otp, setOtp] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const sendOtp = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)
		try {
			await api.post('/api/auth/send-otp', { email })
			success('Verification code sent to your email')
			setStep(2)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not send code')
		} finally {
			setLoading(false)
		}
	}

	const register = async (e: React.FormEvent) => {
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
			await signup({ email, password, phone, otp })
			router.push('/account')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Signup failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthShell
			title="Create Account"
			subtitle={
				step === 1
					? 'Join Taru Fabrics to shop our fabric collection'
					: `Enter the code sent to ${email}`
			}
			image="/karoo/story.jpg"
			footer={
				<>
					Already have an account?{' '}
					<Link href="/login" className="text-accent link-underline">
						Sign in
					</Link>
				</>
			}
		>
			{step === 1 ? (
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
						Send Verification Code
					</Button>
				</form>
			) : (
				<form onSubmit={register} className="space-y-5">
					<Field label="Verification Code" htmlFor="otp">
						<Input
							id="otp"
							inputMode="numeric"
							required
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							placeholder="6-digit code"
						/>
					</Field>
					<Field label="Phone" htmlFor="phone">
						<Input
							id="phone"
							type="tel"
							required
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="10-digit mobile number"
						/>
					</Field>
					<Field label="Password" htmlFor="password">
						<PasswordInput
							id="password"
							required
							minLength={8}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Create a password"
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
							placeholder="Re-enter your password"
							autoComplete="new-password"
						/>
						{confirmPassword.length > 0 && confirmPassword !== password && (
							<p className="mt-1.5 text-xs text-danger">Passwords do not match</p>
						)}
					</Field>
					{error && <p className="text-sm text-danger">{error}</p>}
					<Button type="submit" loading={loading} className="w-full" size="lg">
						Create Account
					</Button>
					<button
						type="button"
						onClick={() => setStep(1)}
						className="w-full text-xs uppercase tracking-[0.15em] text-muted link-underline"
					>
						Change email
					</button>
				</form>
			)}
		</AuthShell>
	)
}
