import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* React Compiler for optimizations */
  reactCompiler: true,

  /* Production optimizations */
  compress: true,
  poweredByHeader: false,

  /* Environment variables validation */
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
  },

  /* Image optimization */
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  /* Security headers */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
