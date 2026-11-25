import type { Metadata } from 'next';
import { DemoLoader } from '@/demo/demo-loader';

export const metadata: Metadata = {
  title: 'Demonstração · KFit',
  description: 'Veja o KFit funcionando: painel do personal e app do aluno num studio de exemplo.',
  robots: { index: false },
};

export default function DemoPage() {
  return <DemoLoader />;
}
