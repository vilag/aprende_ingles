import Link from 'next/link';

import { BrandMark } from './brand-mark';

export function SiteHeader() {
  return (
    <header className="border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <BrandMark />
          <span>AI English Immersion</span>
        </Link>
        <span className="hidden rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-muted sm:inline">
          Beta privada en desarrollo
        </span>
      </div>
    </header>
  );
}
