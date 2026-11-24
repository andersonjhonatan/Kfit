import type { Metadata, Viewport } from 'next';
import { exo, inter } from '@/lib/fonts';
import { INTRO_BOOT } from '@/components/intro';
import './globals.css';

export const metadata: Metadata = {
  title: 'KFit · App para personal trainer e studio',
  description: 'Ficha com vídeo e meta de carga, avaliação física, anamnese e contrato no WhatsApp, Pix e IA. Com a sua marca. Por TresK Tecnologia.',
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0B0B0C' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${exo.variable} ${inter.variable}`} data-intro="done" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
