// Password policy shared by every screen that sets a password (signup, forgot
// password, change password). Mirrored server-side in
// fabric-Ecom-backend/controllers/authController.js and models/User.js —
// this copy is UX only, the backend is the real boundary.
export const PASSWORD_REQUIREMENTS: { key: string; label: string; test: (p: string) => boolean }[] = [
	{ key: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
	{ key: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
	{ key: 'special', label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export function isPasswordValid(password: string): boolean {
	return PASSWORD_REQUIREMENTS.every((r) => r.test(password))
}
