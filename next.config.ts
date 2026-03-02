import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // {
      //   protocol: "https",
      //   hostname: "*.unsplash.com",
      //   pathname: "/**",
      // }
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
    ],
  },
};

export default nextConfig;
