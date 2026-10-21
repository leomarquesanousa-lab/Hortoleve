import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: { remotePatterns: process.env.CMS_STORAGE_PUBLIC_URL ? [{ protocol: "https", hostname: new URL(process.env.CMS_STORAGE_PUBLIC_URL).hostname, pathname: new URL(process.env.CMS_STORAGE_PUBLIC_URL).pathname.replace(/\/$/, "") + "/**" }] : [] },
};

export default nextConfig;
