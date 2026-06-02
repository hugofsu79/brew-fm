import { GuestsSection } from "@/components/artists/GuestsSection";
import { ResidentsAccordionA } from "@/components/artists/ResidentsAccordionA";
import { fetchArtists } from "@/lib/notion/artists";

export default async function ArtistesPage() {
  const all = await fetchArtists();
  const residents = all.filter((a) => a.status === "resident" && a.photoUrl);
  const guests = all.filter((a) => a.status === "guest" && a.photoUrl);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-12 text-4xl font-black tracking-tight uppercase sm:text-5xl">Artistes</h1>

      {/* SECTION RÉSIDENTS */}
      <section className="mb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">🌟 Résidents</h2>
          <p className="mt-1 text-sm text-foreground/60">
            {residents.length} résident{residents.length > 1 ? "s" : ""} — survole pour découvrir
            leur univers.
          </p>
        </div>
        <ResidentsAccordionA residents={residents} />
      </section>

      {/* SÉPARATEUR VISUEL */}
      <hr className="my-16 border-t border-foreground/10" />

      {/* SECTION GUESTS (toggle Mur/Liste) */}
      <GuestsSection artists={guests} />
    </main>
  );
}
