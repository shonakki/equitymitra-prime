type Props = { eyebrow: string; title: string; description?: string };
export function SectionHeader({ eyebrow, title, description }: Props) {
  return (
    <div className="max-w-2xl mb-12">
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--gold)] font-semibold">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-white/60 text-base sm:text-lg">{description}</p>
      )}
    </div>
  );
}
