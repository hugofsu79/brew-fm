"use client";

/**
 * ConditionalFooter — masque le Footer sur la home ("/") pour avoir un vrai
 * "player" plein écran sans footer dessous. Footer conservé sur toutes les
 * autres pages.
 */

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer/Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <Footer />;
}
