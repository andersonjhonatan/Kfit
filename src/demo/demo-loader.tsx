'use client';

import dynamic from 'next/dynamic';

// O protótipo só roda no navegador (lê o template com DOMParser).
export const DemoLoader = dynamic(() => import('./demo-client'), {
  ssr: false,
  loading: () => <div style={{ minHeight: '100dvh', background: '#0B0B0C' }} />,
});
