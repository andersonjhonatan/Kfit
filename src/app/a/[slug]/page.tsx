import type { Metadata, Viewport } from 'next';
import { AlunoApp } from '@/app-ui/aluno/app';

export const metadata: Metadata = { title: 'Meu treino', robots: { index: false } };
export const viewport: Viewport = { themeColor: '#0B0B0C', width: 'device-width', initialScale: 1 };

export default async function AlunoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="kapp">
      <AlunoApp slug={slug} />
    </div>
  );
}
