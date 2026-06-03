/**
 * Layout racine Brew FM.
 *
 * - Charge Inter Variable via next/font/google (auto-hébergé, zero FOUT)
 * - Active le mode dark Brew FM par défaut (fond #05180A, texte #A6FF3E)
 *
 * Footer classique : en fin de page, dans le flux normal.
 * Le body est en flex-col min-h-dvh pour que le footer reste en bas même
 * sur les pages courtes (sticky footer pattern via flex, pas position:sticky).
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/navbar/Navbar";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="flex min-h-dvh flex-col antialiased">
        <Navbar />
        {/* flex-1 pousse le footer en bas même quand la page est courte */}
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
