import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
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
