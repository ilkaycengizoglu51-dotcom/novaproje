/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // small servers: skip the on-disk webpack cache during builds
  webpack: (config) => { config.cache = false; return config; },
  // the public website is a static, hand-built page with 3D scenes
  async rewrites() {
    return { beforeFiles: [{ source: '/', destination: '/site.html' }] };
  },
  experimental: { serverActions: { bodySizeLimit: '12mb' } },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [{ source: '/(.*)', headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }, { key: 'X-Frame-Options', value: 'SAMEORIGIN' }] }];
  },
};
export default nextConfig;
