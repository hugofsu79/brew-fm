/**
 * Page Résidents / Artistes — /artistes
 *
 * Section Résidents (cartes premium) + section "Ont passé chez Brew" (grille dense).
 * Placeholder structurel pour l'instant.
 */

export default function ArtistesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <h1 className="text-5xl font-black uppercase tracking-tight sm:text-7xl">Résidents</h1>
      <p className="mt-4 text-lg text-foreground/60">Les résidents + les artistes qui sont venus</p>

      <section className="mt-16">
        <h2 className="text-2xl font-bold uppercase tracking-wide">🌟 Résidents</h2>
        <p className="mt-4 text-foreground/50">
          (Cartes premium des résidents — 3 colonnes desktop)
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold uppercase tracking-wide">Ont passé chez Brew</h2>
        <p className="mt-4 text-foreground/50">(Grille dense des invités — 6-8 colonnes desktop)</p>
      </section>
    </div>
  );
}
