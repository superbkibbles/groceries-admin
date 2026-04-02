import type { NextConfig } from "next";

const basePath = "/admin";

const nextConfig: NextConfig = {
  /* config options here */
  basePath,
  // Client needs this for libs (e.g. UploadThing) that default to `/api/uploadthing` without basePath
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
