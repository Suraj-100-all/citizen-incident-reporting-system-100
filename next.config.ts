import type { NextConfig } from "next";
import path from "node:path";

const LOADER = path.resolve(__dirname, 'src/visual-edits/component-tagger-loader.js');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
    experimental: {
      serverActions: {
        allowedOrigins: [
          "3000-c6c19678-6225-4493-bd9e-271d51cbf09a.proxy.daytona.works",
          "3000-c6c19678-6225-4493-bd9e-271d51cbf09a.orchids.cloud",
          "https://3000-c6c19678-6225-4493-bd9e-271d51cbf09a.proxy.daytona.works",
          "https://3000-c6c19678-6225-4493-bd9e-271d51cbf09a.orchids.cloud"
        ]
      }
    },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [LOADER]
      }
    }
  }
};

export default nextConfig;
// Orchids restart: 1768020302825
