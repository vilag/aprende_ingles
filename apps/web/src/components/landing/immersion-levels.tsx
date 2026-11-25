import { SectionHeading } from './section-heading';

/** Proporción visual (ilustrativa) de inglés frente a español en cada etapa. */
const levels = [
  {
    name: 'Principiante',
    english: 2,
    text: 'Instrucciones sencillas en inglés con apoyo en español.',
  },
  { name: 'Básico', english: 3, text: 'Inglés predominante y explicaciones puntuales en español.' },
  {
    name: 'Intermedio',
    english: 4,
    text: 'Clases principalmente en inglés y conversaciones más largas.',
  },
  {
    name: 'Avanzado',
    english: 5,
    text: 'Inmersión casi total, situaciones profesionales y expresiones idiomáticas.',
  },
] as const;

export function ImmersionLevels() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading
        eyebrow="Inmersión progresiva"
        title="Más inglés a medida que avanzas"
        description="La inmersión nunca es una barrera: en cualquier momento puedes pedir una explicación en español."
      />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {levels.map((level) => (
          <li key={level.name} className="rounded-2xl border border-border bg-surface p-5">
            <p className="font-semibold">{level.name}</p>
            <div className="mt-3 flex gap-1" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${i < level.english ? 'bg-brand' : 'bg-accent/40'}`}
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-ink-muted">{level.text}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 flex items-center gap-4 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-brand" /> Inglés
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent/40" /> Apoyo en español
        </span>
      </p>
    </section>
  );
}
