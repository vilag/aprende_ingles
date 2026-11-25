import { connection } from 'next/server';

import { getServerApiClient } from '@/lib/api.server';
import { getSystemStatus, type SystemStatusTone } from '@/lib/system-status';

const toneStyles: Record<SystemStatusTone, { dot: string; panel: string; label: string }> = {
  operational: { dot: 'bg-success', panel: 'bg-success-soft', label: 'Operativo' },
  degraded: { dot: 'bg-warning', panel: 'bg-warning-soft', label: 'Degradado' },
  unreachable: { dot: 'bg-danger', panel: 'bg-danger-soft', label: 'Sin conexión' },
};

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'medium',
  timeZone: 'UTC',
});

export async function SystemStatusCard() {
  // Se renderiza en cada petición: el estado nunca se sirve desde el prerender.
  await connection();
  const status = await getSystemStatus(getServerApiClient());
  const tone = toneStyles[status.tone];

  return (
    <article
      className="overflow-hidden rounded-2xl border border-border bg-surface"
      aria-live="polite"
      data-testid="system-status"
      data-tone={status.tone}
    >
      <header className={`flex items-start gap-3 p-5 ${tone.panel}`}>
        <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />
        <div>
          <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
            {tone.label}
          </p>
          <h2 className="mt-0.5 font-semibold">{status.title}</h2>
          <p className="mt-1 text-sm text-ink-muted">{status.description}</p>
        </div>
      </header>

      {status.dependencies.length > 0 && (
        <ul className="divide-y divide-border">
          {status.dependencies.map((dependency) => (
            <li
              key={dependency.name}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span>{dependency.name}</span>
              <span className={dependency.status === 'up' ? 'text-success' : 'text-danger'}>
                {dependency.status === 'up' ? 'Disponible' : 'No disponible'}
              </span>
            </li>
          ))}
        </ul>
      )}

      {(status.version ?? status.checkedAt) && (
        <footer className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border px-5 py-3 text-xs text-ink-muted">
          {status.version && <span>Versión de la API: {status.version}</span>}
          {status.checkedAt && (
            <span>Verificado: {dateFormatter.format(new Date(status.checkedAt))} UTC</span>
          )}
        </footer>
      )}
    </article>
  );
}

export function SystemStatusSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-border bg-surface p-5"
      role="status"
      aria-label="Consultando el estado del sistema"
    >
      <div className="h-3 w-24 rounded bg-surface-muted" />
      <div className="mt-3 h-4 w-2/3 rounded bg-surface-muted" />
      <div className="mt-2 h-3 w-1/2 rounded bg-surface-muted" />
    </div>
  );
}
