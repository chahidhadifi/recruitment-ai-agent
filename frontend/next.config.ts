import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Hide webpack warnings and reduce console noise
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.infrastructureLogging = {
        level: 'error',
      };
      // Suppress specific warnings
      config.ignoreWarnings = [
        /Module not found/,
        /Critical dependency/,
        /Should not import the named export/,
      ];
    }
    return config;
  },
  // Reduce development logging
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Disable Next.js telemetry
  telemetry: false,
  // Configure dev indicators
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // Reduce experimental warnings
  experimental: {
    // Add any experimental features you're using here
    // This helps suppress experimental feature warnings
  },
  /* other config options here */
};

export default nextConfig;