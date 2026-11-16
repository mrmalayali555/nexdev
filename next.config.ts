import type { NextConfig } from "next";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";

const nextConfig: NextConfig = {
  // If building static bundle for Capacitor Android APK, enable export.
  // When deploying to Vercel, leave undefined so full serverless APIs & Postgres work!
  ...(isCapacitorBuild ? { output: "export" as const } : {}),
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
