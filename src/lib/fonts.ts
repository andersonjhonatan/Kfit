import localFont from 'next/font/local';

/** Exo 2 Black Italic: a mesma letra do logo, para títulos e números. */
export const exo = localFont({
  src: [
    { path: '../fonts/exo-2-latin-800-italic.ttf', weight: '800', style: 'italic' },
    { path: '../fonts/exo-2-latin-900-italic.ttf', weight: '900', style: 'italic' },
  ],
  variable: '--font-exo',
  display: 'swap',
});

export const inter = localFont({
  src: [
    { path: '../fonts/inter-latin-400-normal.ttf', weight: '400' },
    { path: '../fonts/inter-latin-500-normal.ttf', weight: '500' },
    { path: '../fonts/inter-latin-600-normal.ttf', weight: '600' },
    { path: '../fonts/inter-latin-700-normal.ttf', weight: '700' },
  ],
  variable: '--font-inter',
  display: 'swap',
});
