import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuration pour Three.js et fichiers 3D
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.infrastructureLogging = {
        level: 'error',
      };
      config.ignoreWarnings = [
        /Module not found/,
        /Critical dependency/,
        /Should not import the named export/,
      ];
    }
    
    // Support pour les fichiers GLB/GLTF
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/models/[hash][ext]'
      }
    });

    // Configuration pour les externals Three.js
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    return config;
  },
  
  // Headers pour CORS et fichiers 3D
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        source: '/avatar.glb',
        headers: [
          {
            key: 'Content-Type',
            value: 'model/gltf-binary',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  telemetry: false,
  
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },

  experimental: {},
};

export default nextConfig;