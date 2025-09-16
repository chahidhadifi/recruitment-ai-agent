import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Résoudre le problème de chargement des chunks
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  // Configurer les options expérimentales
  experimental: {
    // Autres options expérimentales peuvent être ajoutées ici
  }
};

export default nextConfig;
