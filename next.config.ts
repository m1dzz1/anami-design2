import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server.js build for the cPanel Node.js host (packaged by scripts/package-cpanel.mjs)
  output: "standalone",
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
  async redirects() {
    return [
      // One canonical host: www.anami.rs → anami.rs (matches site.url, canonical and hreflang links)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.anami.rs" }],
        destination: "https://anami.rs/:path*",
        permanent: true,
      },
      // Serbian is the default language; permanent so Google consolidates the bare domain onto /sr
      { source: "/", destination: "/sr", permanent: true },
    ];
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
