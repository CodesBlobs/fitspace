/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to the Express backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5050/api/:path*',
      },
    ];
  },
};

export default nextConfig;
