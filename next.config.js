/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [],
    remotePatterns: [],
  },
  // Turbopack is the default bundler in Next.js 16.
  // SVGs are handled as static assets (URL strings) by default — no extra rule needed.
  turbopack: {
    root: __dirname,
  },
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
