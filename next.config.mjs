/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/pediatric',
        destination: '/pediatric/dashboard',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/login',
        destination: '/logIn',
      },
    ];
  },
};

export default nextConfig;
