/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  // Prevent Turbopack from bundling server-only packages that use
  // Node.js APIs like child_process.fork (bull) or native bindings (ioredis).
  serverExternalPackages: ['bull', 'ioredis'],
  images: {
    domains: ['res.cloudinary.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },
  // Empty turbopack config silences the "webpack config but no turbopack config" error.
  // Turbopack handles SVGs as static assets by default — no rules needed here.
  turbopack: {},
  // Retained for explicit `next dev --webpack` / `next build --webpack` only.
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    });
    return config;
  },
};

module.exports = nextConfig;
