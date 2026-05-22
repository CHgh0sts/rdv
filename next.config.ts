import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rendez-vous.social",
        pathname: "/app/**",
      },
    ],
  },
};

export default nextConfig;
