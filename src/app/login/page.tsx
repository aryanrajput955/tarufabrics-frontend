'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { AuthShell } from '@/components/auth/AuthShell'
import { Field, Input } from '@/components/ui/Field'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'

function LoginInner() {
	const { login } = useAuth()
	const router = useRouter()
	const params = useSearchParams()
	const redirect = params.get('redirect')

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)
		try {
			const user = await login(email, password)
			// Honour an explicit ?redirect= target; otherwise send admins to the
			// admin panel and everyone else to their account.
			const dest = redirect || (user.role === 'admin' ? '/admin' : '/account')
			router.push(dest)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Login failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthShell
			title="Welcome Back"
			subtitle="Sign in to your Taru Fabrics account"
			image="/karoo/hero.jpg"
			footer={
				<>
					New to Taru Fabrics?{' '}
					<Link href="/signup" className="text-accent link-underline">
						Create an account
					</Link>
				</>
			}
		>
			<form onSubmit={submit} className="space-y-5">
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
				<Field label="Password" htmlFor="password">
					<PasswordInput
						id="password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="••••••••"
						autoComplete="current-password"
					/>
				</Field>
				{error && <p className="text-sm text-danger">{error}</p>}
				<Button type="submit" loading={loading} className="w-full" size="lg">
					Sign In
				</Button>
				<div className="text-center">
					<Link
						href="/forgot-password"
						className="text-xs uppercase tracking-[0.15em] text-muted link-underline"
					>
						Forgot password?
					</Link>
				</div>
			</form>
		</AuthShell>
	)
}

export default function LoginPage() {
	return (
		<Suspense fallback={<div className="container-page py-24" />}>
			<LoginInner />
		</Suspense>
	)
}
