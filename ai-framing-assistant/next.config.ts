import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the Docker image to ship a minimal runtime: produces
  // `.next/standalone/` with only the files needed to run the server.
  output: "standalone",
};

export default nextConfig;
