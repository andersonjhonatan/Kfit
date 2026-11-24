import { LOGO_BODY, LOGO_VIEWBOX, SYMBOL_BODY, SYMBOL_VIEWBOX } from '@/lib/brand-svg';

export function Logo({ className = 'h-9 w-auto' }: { className?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={className} role="img" aria-label="KFit" dangerouslySetInnerHTML={{ __html: LOGO_BODY }} />
  );
}

export function Symbol({ className = 'h-8 w-auto' }: { className?: string }) {
  return <svg viewBox={SYMBOL_VIEWBOX} className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: SYMBOL_BODY }} />;
}

/** Halter pequeno usado como separador nas faixas */
export function Dumbbell({ className = 'h-4 w-8', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 40 16" className={className} aria-hidden="true">
      <rect x="0" y="3" width="4" height="10" rx="1.5" fill={color} />
      <rect x="5" y="0" width="5" height="16" rx="1.5" fill={color} />
      <rect x="10" y="6.5" width="20" height="3" rx="1" fill={color} />
      <rect x="30" y="0" width="5" height="16" rx="1.5" fill={color} />
      <rect x="36" y="3" width="4" height="10" rx="1.5" fill={color} />
    </svg>
  );
}

/** Símbolo de marca de exemplo (multi-tenant): monograma no formato escolhido */
export function BrandBadge({ mono, color, shape, size = 44 }: { mono: string; color: string; shape: string; size?: number }) {
  const radius = shape === 'round' ? 999 : shape === 'shield' ? `10px 10px ${size / 2}px ${size / 2}px` : 12;
  return (
    <span
      className="display flex flex-none items-center justify-center text-white"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `linear-gradient(145deg, color-mix(in srgb, ${color} 85%, white), color-mix(in srgb, ${color} 80%, black))`,
        fontSize: size * 0.34,
        letterSpacing: '-0.02em',
      }}
    >
      {mono}
    </span>
  );
}
