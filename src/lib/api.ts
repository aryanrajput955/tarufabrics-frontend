// Typed fetch wrapper around the Koa backend (NEXT_PUBLIC_API_URL).
// Attaches the JWT from localStorage and normalizes the { success, data, message } envelope.

const BASE_URL =
	process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3010'

const TOKEN_KEY = 'karoo_token'

export function getToken(): string | null {
	if (typeof window === 'undefined') return null
	return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
	if (typeof window === 'undefined') return
	localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
	if (typeof window === 'undefined') return
	localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
	status: number
	code?: string
	constructor(message: string, status: number, code?: string) {
		super(message)
		this.name = 'ApiError'
		this.status = status
		this.code = code
	}
}

interface ApiEnvelope<T> {
	success: boolean
	message?: string
	data?: T
	code?: string
	pagination?: import('./types').Pagination
	[key: string]: unknown
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

async function request<T>(
	method: Method,
	path: string,
	body?: unknown
): Promise<ApiEnvelope<T>> {
	const headers: Record<string, string> = {}
	const token = getToken()
	if (token) headers['Authorization'] = `Bearer ${token}`
	if (body !== undefined) headers['Content-Type'] = 'application/json'

	let res: Response
	try {
		res = await fetch(`${BASE_URL}${path}`, {
			method,
			headers,
			body: body !== undefined ? JSON.stringify(body) : undefined,
			cache: 'no-store',
		})
	} catch {
		throw new ApiError(
			'Could not reach the server. Please check your connection.',
			0
		)
	}

	let json: ApiEnvelope<T>
	try {
		json = await res.json()
	} catch {
		throw new ApiError('Unexpected server response.', res.status)
	}

	if (!res.ok || json.success === false) {
		throw new ApiError(
			json.message || `Request failed (${res.status})`,
			res.status,
			json.code
		)
	}

	return json
}

export const api = {
	get: <T>(path: string) => request<T>('GET', path),
	post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
	put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
	patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
	del: <T>(path: string, body?: unknown) => request<T>('DELETE', path, body),
}

export { BASE_URL }
