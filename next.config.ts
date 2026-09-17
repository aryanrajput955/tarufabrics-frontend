import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'res.cloudinary.com' },
			{ protocol: 'https', hostname: '**.cloudinary.com' },
		],
		// Next 16 restricts <Image quality> to this allowlist (default is [75]).
		// 90 is used for the large, prominent fabric imagery (heroes, tiles).
		qualities: [75, 90],
	},
}

export default nextConfig
