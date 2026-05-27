/**
 * Page d'accueil temporaire — test de la cascade navbar.
 *
 * Affiche en JSON le résultat de resolveNavbarItems() pour vérifier
 * que toute la chaîne fetch → mapping → cascade fonctionne.
 *
 * Ce fichier sera remplacé par la vraie home (lecteur AzuraCast) en Phase 5.
 */

import { type NavbarResolution, resolveNavbarItems } from "@/lib/cascade/resolve-navbar";

export default async function HomePage() {
  let cascade: NavbarResolution | null = null;
  let error: string | null = null;

  try {
    cascade = await resolveNavbarItems();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="mx-auto max-w-3xl p-8 font-mono text-sm">
      <h1 className="mb-6 text-2xl font-bold">🧪 Test cascade navbar</h1>

      {error && (
        <div className="mb-6 rounded border border-red-500 bg-red-50 p-4">
          <h2 className="mb-2 font-bold text-red-700">❌ Erreur</h2>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {cascade && (
        <>
          <section className="mb-6">
            <h2 className="mb-2 font-bold">🎯 Primary item (navbar)</h2>
            <pre className="overflow-auto rounded bg-zinc-100 p-4 dark:bg-zinc-900">
              {JSON.stringify(cascade.primary, null, 2)}
            </pre>
          </section>

          <section>
            <h2 className="mb-2 font-bold">📋 Agenda complet ({cascade.agenda.length} items)</h2>
            <pre className="overflow-auto rounded bg-zinc-100 p-4 dark:bg-zinc-900">
              {JSON.stringify(cascade.agenda, null, 2)}
            </pre>
          </section>
        </>
      )}
    </main>
  );
}
