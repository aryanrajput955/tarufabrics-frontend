/**
 * Renders a JSON-LD structured-data block. `</script>` inside stringified
 * content would otherwise close the tag early, so it's escaped — the data
 * itself comes from our own DB content, but this is cheap insurance.
 */
export function JsonLd({ data }: { data: object }) {
	const json = JSON.stringify(data).replace(/</g, '\\u003c')
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
