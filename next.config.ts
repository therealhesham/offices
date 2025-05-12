import { url } from "inspector";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {images: {
  remotePatterns: [
   { protocol: "https", hostname: "v5.airtableusercontent.com" },
  ]},  
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint:{
    ignoreDuringBuilds:true,
  }
};

export default nextConfig;
