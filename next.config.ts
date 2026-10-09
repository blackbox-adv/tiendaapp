import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  async redirects() {
    return [
      // Rutas históricas/compartidas que la gente espera: llevan a las reales
      { source: "/register", destination: "/auth/register", permanent: false },
      { source: "/login", destination: "/auth/login", permanent: false },
    ];
  },
  allowedDevOrigins: [
    "preview-chat-537742e2-3ab8-4dac-b38c-c7d8eda4fb46.space.z.ai",
    "*.space.z.ai",
    "*.space.chatglm.site",
  ],
  async headers() {
    return [
      {
        // Modelo del quita-fondos (44 MB): cacheable un día con revalidación ETag.
        // transformers.js además lo cachea en Cache API, así que solo baja 1 vez.
        source: "/models/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        // Librería transformers.js + runtime WASM de onnxruntime: inmutables.
        // Si algún día se actualiza la versión, renombrar la carpeta con versión.
        source: "/js/transformers/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
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
