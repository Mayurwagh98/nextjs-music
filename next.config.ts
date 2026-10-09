import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components: data is dynamic by default and opted into caching with
  // "use cache"; each route is a prerendered static shell with dynamic parts
  // streamed in behind <Suspense> (Partial Prerendering).
  cacheComponents: true,
  partialPrefetching: true,

  images: {
    // Only the hosts the catalog uses. `hostname: "**"` would turn the image
    // optimizer into an open proxy for any URL on the internet.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },

  async redirects() {
    // The old /contact page became /waitlist; keep existing links working.
    return [{ source: "/contact", destination: "/waitlist", permanent: true }];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/audio/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
