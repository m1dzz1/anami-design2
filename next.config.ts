import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Gzip only in production: in dev it buys nothing locally and streaming large files through it
  // triggers Node's "MaxListenersExceededWarning: 11 drain listeners added to [Gzip]"
  compress: process.env.NODE_ENV === "production",
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920, 2560],
    qualities: [70, 75],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // Serbian is the default language
  async redirects() {
    return [{ source: "/", destination: "/sr", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
