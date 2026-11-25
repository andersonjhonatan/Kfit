import type { Metadata, Viewport } from 'next';
import { exo, inter } from '@/lib/fonts';
import { INTRO_BOOT, THEME_BOOT } from '@/lib/boot';
import './globals.css';

export const metadata: Metadata = {
  title: 'KFit · App para personal trainer e studio',
  description: 'Ficha com vídeo e meta de carga, avaliação física, anamnese e contrato no WhatsApp, Pix e IA. Com a sua marca. Por TresK Tecnologia.',
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0B0B0C' }, { media: '(prefers-color-scheme: light)', color: '#F6F7FA' }] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${exo.variable} ${inter.variable}`} data-intro="done" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT + INTRO_BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
