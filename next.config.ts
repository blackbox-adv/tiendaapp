import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  allowedDevOrigins: [
    "preview-chat-537742e2-3ab8-4dac-b38c-c7d8eda4fb46.space.z.ai",
    "*.space.z.ai",
    "*.space.chatglm.site",
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
