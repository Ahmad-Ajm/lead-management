import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-build",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
