/**
 * Layout racine Brew FM.
 *
 * - Charge Inter Variable via next/font/google (auto-hébergé, zero FOUT)
 * - Active le mode dark Brew FM par défaut (fond #05180A, texte #A6FF3E)
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      <body className="min-h-dvh antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
