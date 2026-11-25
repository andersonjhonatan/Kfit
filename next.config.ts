import type { NextConfig } from 'next';

// STATIC_EXPORT=1 gera o site em /out (prévia estática). Na Vercel, roda normal.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  ...(process.env.STATIC_EXPORT ? { output: 'export' as const, images: { unoptimized: true } } : {}),
};

export default nextConfig;
