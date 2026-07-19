import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  reactCompiler: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
