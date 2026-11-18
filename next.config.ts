import type { NextConfig } from "next";

// STATIC_EXPORT=1 — сборка статической версии для GitHub Pages (папка out/)
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = isStatic
  ? {
      output: "export",
      basePath,
      trailingSlash: true,
      images: { unoptimized: true },
      env: { NEXT_PUBLIC_STATIC: "1", NEXT_PUBLIC_BASE_PATH: basePath },
    }
  : {
      poweredByHeader: false,
      async headers() {
        return [
          {
            source: "/:path*",
            headers: [
              { key: "X-Content-Type-Options", value: "nosniff" },
              { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
              { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
            ],
          },
          { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
        ];
      },
    };

export default nextConfig;
