// PayFast is a hosted-redirect gateway (unlike Razorpay's embeddable checkout modal) — paying
// means building a hidden form of the fields the backend signed, then submitting it as a POST
// so the browser navigates to PayFast's own payment page.

export function redirectToPayFast(url: string, fields: Record<string, string>): void {
	if (typeof document === 'undefined') return

	const form = document.createElement('form')
	form.method = 'POST'
	form.action = url

	for (const [key, value] of Object.entries(fields)) {
		const input = document.createElement('input')
		input.type = 'hidden'
		input.name = key
		input.value = value
		form.appendChild(input)
	}

	document.body.appendChild(form)
	form.submit()
}
