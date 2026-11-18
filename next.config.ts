import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// 讓本地 next dev 能直接調用本地 D1 SQLite 與 KV 資源
initOpenNextCloudflareForDev();

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https://images.pokemontcg.io https://images.unsplash.com https://images.ygoprodeck.com https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com https://api.dicebear.com https://*.trycloudflare.com https://*.ngrok-free.dev https://*.ngrok-free.app;
      font-src 'self' data:;
      connect-src 'self' https://generativelanguage.googleapis.com https://oauth2.googleapis.com https://www.googleapis.com https://accounts.google.com https://*.trycloudflare.com https://*.ngrok-free.dev https://*.ngrok-free.app wss: ws:;
      media-src 'self' blob: data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self' https://accounts.google.com;
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `
      .replace(/\s{2,}/g, ' ')
      .trim(),
  },
];

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
    '*.ngrok-free.app',
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
