import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// 讓本地 next dev 能直接調用本地 D1 SQLite 與 KV 資源
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  /* config options here */
  devIndicators: false,
  allowedDevOrigins: [
    'marriage-pro-marco-occurred.trycloudflare.com',
    '*.trycloudflare.com',
    'reverse-placate-unethical.ngrok-free.dev',
    '*.ngrok-free.dev',
    '*.ngrok-free.app'
  ],
};

export default nextConfig;
