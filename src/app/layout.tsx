/**
 * Layout racine Brew FM.
 *
 * - Inter Variable (next/font), mode dark par défaut.
 * - RadioPlayerProvider : <audio> GLOBAL unique → la musique continue d'une
 *   page à l'autre. Enveloppe toute l'app.
 * - MiniPlayer : carte flottante bas-droit, sur toutes les pages sauf la home.
 * - Bannière live Twitch sticky globale (si live).
 * - Footer conditionnel (masqué sur la home).
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConditionalFooter } from "@/components/footer/ConditionalFooter";
import { Navbar } from "@/components/navbar/Navbar";
import { MiniPlayer } from "@/components/radio/MiniPlayer";
import { RadioPlayerProvider } from "@/components/radio/RadioPlayerProvider";
import { TwitchLiveBanner } from "@/components/twitch/TwitchLiveBanner";
import { resolveNavbarItems } from "@/lib/cascade/resolve-navbar";
import { getNowPlaying } from "@/lib/radio/now-playing";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brew FM",
  description: "Collectif parisien — Club in the Coffee shop, Coffee shop in the Club",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [{ twitch }, nowPlaying] = await Promise.all([resolveNavbarItems(), getNowPlaying()]);

  return (
    <html lang="fr" className={inter.variable}>
      <body className="flex min-h-dvh flex-col antialiased">
        <RadioPlayerProvider streamUrl={nowPlaying.streamUrl}>
          <TwitchLiveBanner status={twitch} />
          <Navbar />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />
          {/* Mini-player flottant (sauf home) — suit l'auditeur */}
          <MiniPlayer />
        </RadioPlayerProvider>
      </body>
    </html>
  );
}
