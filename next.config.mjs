/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    '@remotion/bundler',
    '@remotion/renderer',
    '@remotion/compositor-darwin-arm64',
    '@remotion/compositor-linux-x64-gnu',
    '@remotion/compositor-linux-x64-musl',
    'remotion',
  ],
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    'localhost:3000',
    'localhost:3001',
    '127.0.0.1:3000',
    '127.0.0.1:3001',
  ],
}

export default nextConfig
