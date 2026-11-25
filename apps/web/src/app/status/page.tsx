import type { Metadata } from 'next';
import { Suspense } from 'react';

import { SystemStatusCard, SystemStatusSkeleton } from '@/components/system-status-card';

export const metadata: Metadata = {
  title: 'Estado del sistema',
  description: 'Estado en tiempo real de la plataforma AI English Immersion.',
};

export default function StatusPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Estado del sistema</h1>
      <p className="mt-2 text-ink-muted">Consulta en tiempo real a la API de la plataforma.</p>
      <div className="mt-8">
        {/* El estado se obtiene en cada petición; el resto de la página es estático. */}
        <Suspense fallback={<SystemStatusSkeleton />}>
          <SystemStatusCard />
        </Suspense>
      </div>
    </section>
  );
}
