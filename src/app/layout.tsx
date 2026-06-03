/**
 * Layout racine Brew FM.
 *
 * - Charge Inter Variable via next/font/google (auto-hébergé, zero FOUT)
 * - Active le mode dark Brew FM par défaut (fond #05180A, texte #A6FF3E)
 * - Bannière live Twitch sticky GLOBALE au-dessus de tout (visible seulement
 *   si un live est en cours). Le statut est résolu via resolveNavbarItems() ;
 *   Next.js déduplique l'appel déjà fait par la Navbar (même requête, même
 *   cache) → pas de fetch supplémentaire.
 *
 * Footer classique en fin de page (flex-col + flex-1 → reste en bas).
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/footer/Footer";
import { Navbar } from "@/components/navbar/Navbar";
import { TwitchLiveBanner } from "@/components/twitch/TwitchLiveBanner";
import { resolveNavbarItems } from "@/lib/cascade/resolve-navbar";
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
  // Résolu une fois ici ; déjà appelé par la Navbar → dédupliqué par Next.
  const { twitch } = await resolveNavbarItems();

  return (
    <html lang="fr" className={inter.variable}>
      <body className="flex min-h-dvh flex-col antialiased">
        {/* Bannière live globale (sticky, au-dessus de la navbar). null si pas de live. */}
        <TwitchLiveBanner status={twitch} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
