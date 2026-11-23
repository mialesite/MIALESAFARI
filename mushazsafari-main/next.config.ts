import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    // Library sources are capped at 1600px wide, so widths above that would
    // only ever return an upscale.
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    qualities: [60, 70, 75, 80],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Only the client's own CMS uploads remain remote; every editorial photo
    // ships from /images.
    remotePatterns: [{ protocol: "https", hostname: "uploads.mushazsafari.com" }],
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
