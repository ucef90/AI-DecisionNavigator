import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the Docker image to ship a minimal runtime: produces
  // `.next/standalone/` with only the files needed to run the server.
  output: "standalone",
  // Masque l'indicateur "N" Next.js en bas de l'écran en mode développement.
  devIndicators: false,
};

export default nextConfig;
