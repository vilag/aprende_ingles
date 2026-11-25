import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>AI English Immersion · Aprende a pensar en inglés</p>
        <Link href="/status" className="underline-offset-4 hover:text-ink hover:underline">
          Estado del sistema
        </Link>
      </div>
    </footer>
  );
}
