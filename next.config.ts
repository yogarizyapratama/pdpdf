import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Disable turbopack for pdf-lib compatibility
    turbo: {
      rules: {
        '*.js': {
          loaders: ['babel-loader'],
        },
      },
    },
  },
  webpack: (config, { isServer }) => {
    // Handle PDF.js worker files
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }
    
    // Handle WASM files for PDF processing
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // Fix for pdf-lib chunk loading issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        canvas: false,
      }
    }

    // Optimize chunks for PDF libraries
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          pdf: {
            test: /[\\/]node_modules[\\/](pdf-lib|pdfjs-dist|react-pdf)[\\/]/,
            name: 'pdf-libraries',
            chunks: 'all',
            priority: 10,
          },
        },
      },
    }
    
    return config
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig;
