/**
 * Page About — /about
 *
 * Présentation du collectif Brew FM. Placeholder structurel pour l'instant.
 */

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <h1 className="text-5xl font-black uppercase tracking-tight sm:text-7xl">About</h1>
      <p className="mt-4 text-lg text-foreground/60">L'histoire, la vision</p>

      <section className="mt-16 space-y-6 text-lg leading-relaxed">
        <p>
          Brew FM est un collectif parisien qui mixe café de spécialité et musique électronique.
        </p>
        <p className="text-foreground/70">
          (La présentation complète du collectif s'affichera ici)
        </p>
      </section>
    </div>
  );
}
