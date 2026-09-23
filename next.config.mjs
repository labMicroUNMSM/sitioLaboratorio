/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  images: {
    // Payload sirve medios ya convertidos a WebP/AVIF (ver colección Media);
    // esto solo permite el propio origen del sitio.
    remotePatterns: [],
  },
}

export default nextConfig
