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
          "3000-4840b3e6-8783-4685-8618-cc5e03c2c4a7.proxy.daytona.works",
          "3000-4840b3e6-8783-4685-8618-cc5e03c2c4a7.orchids.cloud",
          "https://3000-4840b3e6-8783-4685-8618-cc5e03c2c4a7.proxy.daytona.works",
          "https://3000-4840b3e6-8783-4685-8618-cc5e03c2c4a7.orchids.cloud",
          "localhost:3000"
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
