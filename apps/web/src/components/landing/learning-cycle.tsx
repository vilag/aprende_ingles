import { SectionHeading } from './section-heading';

const steps = [
  { title: 'Evaluar', text: 'Una evaluación inicial estima tu nivel por habilidad.' },
  { title: 'Priorizar', text: 'Identificamos tus debilidades y definimos objetivos concretos.' },
  { title: 'Practicar', text: 'Actividades a la dificultad adecuada: ni aburridas ni imposibles.' },
  { title: 'Medir', text: 'Cada resultado actualiza tu progreso con criterios objetivos.' },
  { title: 'Repasar', text: 'La repetición espaciada programa lo que necesitas recordar.' },
] as const;

export function LearningCycle() {
  return (
    <section className="border-y border-border/70 bg-surface-muted/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <SectionHeading
          eyebrow="Método"
          title="Un ciclo de aprendizaje con reglas claras"
          description="La IA explica y conversa contigo. Tu avance lo deciden reglas pedagógicas trazables, basadas en evidencia de tu desempeño."
        />
        <ol className="mt-12 grid gap-4 md:grid-cols-5">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl bg-surface p-5 shadow-sm">
              <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                {index + 1}
              </span>
              <p className="mt-4 font-semibold">{step.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
