/**
 * Page d'accueil Brew FM — player radio plein écran.
 *
 * Server Component : fetch le now playing (mock), délègue au RadioHero (client)
 * qui occupe strictement la hauteur de l'écran et intègre lui-même le ticker
 * "UP NEXT" en overlay bas. La navbar (overlay fixed) se superpose en haut.
 */

import { RadioHero } from "@/components/radio/RadioHero";
import { getNowPlaying } from "@/lib/radio/now-playing";

export default async function HomePage() {
  const nowPlaying = await getNowPlaying();

  return <RadioHero data={nowPlaying} />;
}
