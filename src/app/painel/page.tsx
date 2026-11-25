import type { Metadata, Viewport } from 'next';
import { Painel } from '@/app-ui/painel/painel';

export const metadata: Metadata = {
  title: 'Painel · KFit',
  robots: { index: false },
};
export const viewport: Viewport = { themeColor: '#0B0B0C', width: 'device-width', initialScale: 1 };

export default function PainelPage() {
  return (
    <div className="kapp">
      <Painel />
    </div>
  );
}
