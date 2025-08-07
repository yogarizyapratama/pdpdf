import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during build for now
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  webpack: (config) => {
    // Minimal webpack config
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      canvas: false,
    }
    
    return config
  },
}

export default nextConfig;
