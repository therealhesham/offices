import type { NextConfig } from "next";

const region =
  process.env.DO_SPACES_REGION ??
  process.env.NEXT_PUBLIC_DO_SPACES_REGION ??
  "sgp1";
const endpoint =
  process.env.DO_SPACES_ENDPOINT ??
  process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT ??
  `https://${region}.digitaloceanspaces.com`;

const nextConfig: NextConfig = {
  // Map DO_SPACES_* (or explicit NEXT_PUBLIC_*) into the client bundle for timeline uploads.
  env: {
    NEXT_PUBLIC_DO_SPACES_BUCKET:
      process.env.DO_SPACES_BUCKET ?? process.env.NEXT_PUBLIC_DO_SPACES_BUCKET ?? "",
    NEXT_PUBLIC_DO_SPACES_REGION: region,
    NEXT_PUBLIC_DO_SPACES_KEY:
      process.env.DO_SPACES_KEY ?? process.env.NEXT_PUBLIC_DO_SPACES_KEY ?? "",
    NEXT_PUBLIC_DO_SPACES_SECRET:
      process.env.DO_SPACES_SECRET ?? process.env.NEXT_PUBLIC_DO_SPACES_SECRET ?? "",
    NEXT_PUBLIC_DO_SPACES_ENDPOINT: endpoint,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "v5.airtableusercontent.com" },
      { protocol: "https", hostname: `*.${region}.digitaloceanspaces.com` },
    ],
  },
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
