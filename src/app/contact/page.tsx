import type { Metadata } from 'next'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
	title: 'Contact',
	description:
		'Get in touch with Taru Fabrics — questions about a fabric, an order, or a bulk enquiry.',
	alternates: { canonical: '/contact' },
}

export default function ContactPage() {
	return <ContactForm />
}
