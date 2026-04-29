import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-537742e2-3ab8-4dac-b38c-c7d8eda4fb46.space.z.ai",
    "*.space.z.ai",
    "*.space.chatglm.site",
  ],
};

export default nextConfig;
