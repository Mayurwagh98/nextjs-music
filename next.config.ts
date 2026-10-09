import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Only allow the hosts the catalog actually uses. The previous `hostname: "**"`
    // turned the image optimizer into an open proxy for any URL on the internet.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      // OAuth avatars (Phase 4)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
