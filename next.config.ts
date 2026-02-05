import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable image optimization for external sources if needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Ensure Prisma works correctly in serverless environment
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
