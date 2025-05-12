import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "picsum.photos",
      "qgame3ccfcbtygae.public.blob.vercel-storage.com", // Add the required domain here
    ],
  },
};

export default nextConfig;
