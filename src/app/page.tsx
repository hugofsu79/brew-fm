/**
 * Page d'accueil temporaire — test des données navbar.
 *
 * Affiche en JSON le résultat de resolveNavbarItems() pour vérifier que la
 * chaîne fetch → mapping fonctionne (events Shotgun + statut Twitch mocké).
 *
 * Ce fichier sera remplacé par la vraie home (lecteur AzuraCast) en Phase 5.
 */

import { type NavbarResolution, resolveNavbarItems } from "@/lib/cascade/resolve-navbar";

export default async function HomePage() {
  let resolution: NavbarResolution | null = null;
  let error: string | null = null;

  try {
    resolution = await resolveNavbarItems();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="mx-auto max-w-3xl p-8 font-mono text-sm">
      <h1 className="mb-6 text-2xl font-bold">🧪 Test données navbar</h1>

      {error && (
        <div className="mb-6 rounded border border-red-500 bg-red-50 p-4">
          <h2 className="mb-2 font-bold text-red-700">❌ Erreur</h2>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {resolution && (
        <>
          <section className="mb-6">
            <h2 className="mb-2 font-bold">🟣 Zone Twitch</h2>
            <pre className="overflow-auto rounded bg-zinc-100 p-4 dark:bg-zinc-900">
              {JSON.stringify(resolution.twitch, null, 2)}
            </pre>
          </section>

          <section>
            <h2 className="mb-2 font-bold">
              🎫 Events Shotgun à venir ({resolution.events.length})
            </h2>
            <pre className="overflow-auto rounded bg-zinc-100 p-4 dark:bg-zinc-900">
              {JSON.stringify(resolution.events, null, 2)}
            </pre>
          </section>
        </>
      )}
    </main>
  );
}
