/**
 * Page d'accueil Brew FM — player radio plein écran + recette du mois.
 *
 * Server Component : fetch le now playing (mock) ET la recette mise en avant,
 * passe les deux au RadioHero. La recette peut être null (aucune éligible) →
 * l'onglet "Recette du mois" ne s'affiche alors pas.
 */

import { RadioHero } from "@/components/radio/RadioHero";
import { getFeaturedRecipe } from "@/lib/notion/recipes";
import { getNowPlaying } from "@/lib/radio/now-playing";

export default async function HomePage() {
  const [nowPlaying, recipe] = await Promise.all([getNowPlaying(), getFeaturedRecipe()]);

  return <RadioHero data={nowPlaying} recipe={recipe} />;
}
