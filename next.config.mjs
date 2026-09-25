import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['sharp'], // <-- ESTA LÍNEA ES CRUCIAL PARA DOCKER
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  images: {
    remotePatterns: [],
  },
}

export default withPayload(nextConfig)