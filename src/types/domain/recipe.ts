/**
 * Type domaine — Recette (boisson) Brew FM.
 *
 * Source : base Notion "Recettes boissons".
 * La recette affichée sur la home = la plus récente avec une "Date de mise en
 * avant" <= aujourd'hui (voir recipes.ts).
 *
 * Le coût matière (interne) n'est PAS exposé côté domaine public.
 */

export type Recipe = {
  id: string;
  title: string; // Nom de la recette
  featuredDate?: string; // Date de mise en avant (ISO) — colonne à créer
  photoUrl?: string; // Photo principale
  drinkBase?: string; // Base de la boisson
  drinkType?: string; // Type de boisson
  temperature?: string; // Chaude / Froide
  difficulty?: string; // Niveau de difficulté
  prepTimeMin?: number; // temps de préparation (min)
  finalVolume?: string; // Volume final + unité (ex: "350 ml")
  season?: string[]; // Saison (multi)
  material?: string[]; // Matériel (multi)
  ingredients?: string; // Ingrédients détaillés (texte multi-lignes)
  steps?: string; // Préparation détaillée
  proTip?: string; // Astuce Pro
  story?: string; // Histoire / Inspiration
  author?: string; // Auteur·rice
  partnerShop?: string; // Coffee shop partenaire
  vibeTags?: string[]; // Tags vibe
  allergens?: string[]; // Allergènes
  diet?: string[]; // Régime
};
