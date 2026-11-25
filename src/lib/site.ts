/**
 * Dados de vendas do KFit. Troque aqui o WhatsApp, os planos e o período de teste.
 */
export const SITE = {
  name: 'KFit',
  /** WhatsApp comercial da TresK Tecnologia, só dígitos com DDI. */
  whatsapp: '5587991104152',
  instagram: 'tresktecnologia',
  trialDays: 14,
  baseUrl: 'kfit.tresktecnologia.com.br',
  /**
   * Planos. `price: null` mostra "Fale com a gente" no lugar do valor:
   * preencha quando definir os preços (ex.: '49,90').
   */
  plans: [
    {
      name: 'Solo',
      tag: 'Para o personal que atende sozinho',
      price: null as string | null,
      features: ['Até 30 alunos', 'Ficha com vídeo e meta de carga', 'Agenda e link para marcar', 'Avaliação física completa', 'Anamnese, PAR-Q e contrato digital'],
      highlight: false,
    },
    {
      name: 'Pro',
      tag: 'Para quem quer automatizar tudo',
      price: null as string | null,
      features: ['Alunos ilimitados', 'Tudo do Solo', 'Lembretes e cobrança por Pix no WhatsApp', 'Atendimento automático no WhatsApp', 'Sua marca: logo, cor e link próprios'],
      highlight: true,
    },
    {
      name: 'Studio',
      tag: 'Para studios e equipes',
      price: null as string | null,
      features: ['Vários professores', 'Tudo do Pro', 'Aulas, turmas e check-in', 'Modo TV com cronômetro e placar', 'Relatórios do studio'],
      highlight: false,
    },
  ],
} as const;

export function whatsappLink(text: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

/** Marcas de exemplo para mostrar o multi-tenant (cada personal com a sua). */
export const DEMO_BRANDS = [
  { id: 'vev', name: 'VEV Funcional', slogan: 'Treino funcional em grupo', mono: 'VEV', color: '#F97316', slug: 'vev-funcional', shape: 'shield' },
  { id: 'iron', name: 'Iron Studio', slogan: 'Força e hipertrofia', mono: 'IS', color: '#DC2626', slug: 'iron-studio', shape: 'square' },
  { id: 'cm', name: 'Corpo em Movimento', slogan: 'Saúde em todas as idades', mono: 'CM', color: '#16A34A', slug: 'corpo-em-movimento', shape: 'round' },
  { id: 'bella', name: 'Studio Bella Fit', slogan: 'Treino feminino', mono: 'BF', color: '#DB2777', slug: 'studio-bella-fit', shape: 'shield' },
] as const;

export type DemoBrand = (typeof DEMO_BRANDS)[number];
