'use client'

import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	type ReactNode,
} from 'react'
import { api, setToken, clearToken, getToken } from '@/lib/api'
import type { User } from '@/lib/types'

interface AuthContextValue {
	user: User | null
	loading: boolean
	login: (email: string, password: string) => Promise<User>
	signup: (payload: {
		email: string
		password: string
		phone: string
		otp: string
	}) => Promise<User>
	logout: () => void
	refresh: () => Promise<void>
	setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	const refresh = useCallback(async () => {
		if (!getToken()) {
			setUser(null)
			setLoading(false)
			return
		}
		try {
			const res = await api.get<{ user: User }>('/api/auth/me')
			setUser(res.data?.user ?? null)
		} catch {
			clearToken()
			setUser(null)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		refresh()
	}, [refresh])

	const login = useCallback(async (email: string, password: string) => {
		const res = await api.post<{ user: User; token: string }>(
			'/api/auth/login',
			{ email, password }
		)
		if (!res.data) throw new Error('Login failed')
		setToken(res.data.token)
		setUser(res.data.user)
		return res.data.user
	}, [])

	const signup = useCallback(
		async (payload: {
			email: string
			password: string
			phone: string
			otp: string
		}) => {
			const res = await api.post<{ user: User; token: string }>(
				'/api/auth/signup',
				payload
			)
			if (!res.data) throw new Error('Signup failed')
			setToken(res.data.token)
			setUser(res.data.user)
			return res.data.user
		},
		[]
	)

	const logout = useCallback(() => {
		clearToken()
		setUser(null)
	}, [])

	return (
		<AuthContext.Provider
			value={{ user, loading, login, signup, logout, refresh, setUser }}
		>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
	return ctx
}
