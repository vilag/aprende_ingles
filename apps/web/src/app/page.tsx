import { ExampleConversation } from '@/components/landing/example-conversation';
import { ImmersionLevels } from '@/components/landing/immersion-levels';
import { LearningCycle } from '@/components/landing/learning-cycle';
import { SkillsGrid } from '@/components/landing/skills-grid';

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-[-10%] size-[36rem] rounded-full bg-brand-soft blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent">
              Your personal English teacher
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Aprende a <span className="text-brand">pensar en inglés</span>, no solo a traducirlo.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-pretty text-ink-muted">
              Un profesor con inteligencia artificial que conoce tu nivel, tus errores y tus
              objetivos. Conversación real, pronunciación y comprensión auditiva, con un plan que se
              adapta a ti y criterios de progreso medibles.
            </p>
            <p className="mt-8 text-sm text-ink-muted">
              Estamos construyendo la plataforma. La beta privada abrirá próximamente.
            </p>
          </div>
          <ExampleConversation />
        </div>
      </section>

      <SkillsGrid />
      <LearningCycle />
      <ImmersionLevels />
    </>
  );
}
