/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Define aliases for client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Disable fallback for fs module
      };
    }
    return config;
  },
}

module.exports = nextConfig