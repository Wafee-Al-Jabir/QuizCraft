import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['framer-motion'],
  webpack: (config, { isServer, dev }) => {
    // Fallback for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Improve module resolution
    config.resolve.modules = [
      'node_modules',
      ...(config.resolve.modules || [])
    ];
    
    // Ensure proper alias resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    
    // Optimize for production builds
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }
    
    return config;
  },
}

export default nextConfig