/**
 * Page About — /about
 *
 * Présentation du collectif Brew FM, style brutaliste.
 * Le contenu est statique (en dur dans AboutContent). Le composant est "use client"
 * car il utilise Motion pour les animations reveal au scroll.
 */

import { AboutContent } from "@/components/about/AboutContent";

export default function AboutPage() {
  return <AboutContent />;
}
