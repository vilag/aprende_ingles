export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold tracking-wide text-brand uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      <p className="mt-4 text-lg text-pretty text-ink-muted">{description}</p>
    </div>
  );
}
