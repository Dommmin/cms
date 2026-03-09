import type { NextConfig } from "next";

const apiHostname = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
  : "localhost";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Laravel API / storage (nginx on default port 80)
        protocol: "http",
        hostname: apiHostname,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: apiHostname,
        pathname: "/**",
      },
      {
        // Spatie media-library often serves from a CDN or S3
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
