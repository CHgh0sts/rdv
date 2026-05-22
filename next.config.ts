import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rendez-vous.social",
        pathname: "/app/**",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "e-cdns-images.dzcdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-images.dzcdn.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
