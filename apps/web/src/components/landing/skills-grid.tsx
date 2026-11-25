import { SectionHeading } from './section-heading';

const skills = [
  {
    name: 'Listening',
    es: 'Comprensión auditiva',
    text: 'Conversaciones reales a velocidad natural.',
  },
  { name: 'Speaking', es: 'Expresión oral', text: 'Practica escenarios de la vida real con voz.' },
  {
    name: 'Pronunciation',
    es: 'Pronunciación',
    text: 'Retroalimentación por sonido, no solo por transcripción.',
  },
  { name: 'Reading', es: 'Lectura', text: 'Textos adaptados a tu nivel y a tus intereses.' },
  { name: 'Writing', es: 'Escritura', text: 'Correcciones explicadas, no solo reescritas.' },
  {
    name: 'Grammar',
    es: 'Gramática',
    text: 'Estructuras aprendidas en contexto, con práctica activa.',
  },
  {
    name: 'Vocabulary',
    es: 'Vocabulario',
    text: 'Palabras y expresiones con repetición espaciada.',
  },
] as const;

export function SkillsGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading
        eyebrow="Siete habilidades"
        title="Medimos cada habilidad por separado"
        description="Hablar bien no significa entender bien. Por eso tu plan se construye a partir de tu desempeño real en cada habilidad."
      />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((skill) => (
          <li key={skill.name} className="rounded-2xl border border-border bg-surface p-5">
            <p className="font-semibold">{skill.name}</p>
            <p className="text-sm text-ink-muted">{skill.es}</p>
            <p className="mt-3 text-sm text-ink">{skill.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
