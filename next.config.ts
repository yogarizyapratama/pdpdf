import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment optimizations
  output: 'standalone',
  
  // SEO and metadata configuration
  async generateBuildId() {
    // Use git commit hash or timestamp for better cache busting
    return process.env.VERCEL_GIT_COMMIT_SHA || new Date().getTime().toString()
  },

  // Environment-specific URL handling
  env: {
    CUSTOM_BASE_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  },

  // Build optimization
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during build for now
    ignoreBuildErrors: true,
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // External packages for server components (moved from experimental)
  serverExternalPackages: ['pdf-lib', 'canvas'],

  // Image optimization for Vercel
  images: {
    domains: ['pdpdf.vercel.app'],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/pdf-tools',
        destination: '/',
        permanent: true,
      },
      // Add more redirects as needed for SEO
    ]
  },

  webpack: (config) => {
    // PDF processing optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      canvas: false,
    }
    
    // Optimization for PDF libraries
    config.externals = config.externals || []
    if (!config.externals.includes('canvas')) {
      config.externals.push('canvas')
    }
    
    return config
  },
}

export default nextConfig;
