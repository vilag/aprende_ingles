/** Logotipo: burbuja de conversación con las iniciales "AI". */
export function BrandMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="2" y="3" width="28" height="22" rx="8" className="fill-brand" />
      <path d="M9 25 L9 30 L15 25 Z" className="fill-brand" />
      <text
        x="16"
        y="18.5"
        textAnchor="middle"
        className="fill-on-brand"
        style={{ font: '700 11px var(--font-jakarta), sans-serif', letterSpacing: '0.5px' }}
      >
        AI
      </text>
    </svg>
  );
}
