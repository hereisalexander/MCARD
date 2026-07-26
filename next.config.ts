import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'reverse-placate-unethical.ngrok-free.dev',
    '*.ngrok-free.dev',
    '*.ngrok-free.app'
  ],
};

export default nextConfig;
