/**
 * Ilustración del concepto del tutor. Es contenido de EJEMPLO, no una conversación
 * real ni datos de un estudiante, y así se indica en la interfaz.
 */
export function ExampleConversation() {
  return (
    <figure className="rounded-3xl border border-border bg-surface p-5 shadow-xl shadow-brand/5 sm:p-6">
      <figcaption className="mb-5 flex items-center justify-between text-xs font-medium text-ink-muted">
        <span>Job interview · Practice</span>
        <span className="rounded-full bg-surface-muted px-2.5 py-1">Ejemplo ilustrativo</span>
      </figcaption>

      <div className="space-y-4 text-[15px] leading-relaxed">
        <Bubble from="tutor">Tell me about a project you&apos;re proud of.</Bubble>
        <Bubble from="student">I am working in a app for my company since two years.</Bubble>

        <div className="rounded-2xl border border-accent/30 bg-accent-soft/60 p-4 text-sm">
          <p className="font-semibold text-ink">Corrección</p>
          <p className="mt-1 text-ink">
            I&apos;ve <span className="font-semibold">been</span> working{' '}
            <span className="font-semibold">on an</span> app for my company{' '}
            <span className="font-semibold">for</span> two years.
          </p>
          <p className="mt-2 text-ink-muted">
            «Since» se usa con un punto en el tiempo (since 2024); «for» con una duración.
          </p>
        </div>

        <Bubble from="tutor">Great! What was the biggest challenge?</Bubble>
      </div>
    </figure>
  );
}

function Bubble({ from, children }: { from: 'tutor' | 'student'; children: React.ReactNode }) {
  const isTutor = from === 'tutor';
  return (
    <div className={`flex ${isTutor ? 'justify-start' : 'justify-end'}`}>
      <p
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isTutor
            ? 'rounded-bl-md bg-surface-muted text-ink'
            : 'rounded-br-md bg-brand text-on-brand'
        }`}
      >
        <span className="sr-only">{isTutor ? 'Tutor: ' : 'Estudiante: '}</span>
        {children}
      </p>
    </div>
  );
}
