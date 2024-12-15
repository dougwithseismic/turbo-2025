import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // transpilePackages: ['motion/react'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
