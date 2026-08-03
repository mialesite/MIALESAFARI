import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "development.orbituniverse.co.tz",
      },
      {
        protocol: "https",
        hostname: "orbituniverse.co.tz",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "uploads.mushazsafari.com",
      },
    ],
  },
};

export default nextConfig;
