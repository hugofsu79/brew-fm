/**
 * Fetch & mapping des recettes depuis Notion.
 *
 * Source : base Notion "Recettes boissons".
 *
 * Sélection de LA recette mise en avant (home) :
 *   - on garde celles qui ont une "Date de mise en avant" <= maintenant
 *   - on trie par date décroissante → la plus récente gagne
 *   - permet de pré-programmer une recette future (elle n'apparaît qu'à sa date)
 *
 * ⚠️ PRÉREQUIS : ajouter dans la base Notion une colonne de type Date nommée
 *    "Date de mise en avant". Sans elle, getFeaturedRecipe() renvoie null.
 *
 * Mapping colonnes Notion (FR) → champs Recipe :
 *   Nom de la recette       → title
 *   Date de mise en avant   → featuredDate   (À CRÉER)
 *   Photo principale        → photoUrl
 *   Base de la boisson      → drinkBase
 *   Type de boisson         → drinkType
 *   Température             → temperature
 *   Niveau de difficulté    → difficulty
 *   temps de préparation    → prepTimeMin
 *   Volume final + Unité    → finalVolume
 *   Saison                  → season[]
 *   Matériel                → material[]
 *   Ingrédients détaillés   → ingredients
 *   Préparation détaillée   → steps
 *   Astuce Pro              → proTip
 *   Histoire / Inspiration  → story
 *   Auteur·rice             → author
 *   Coffee shop partenaire  → partnerShop
 *   Tags vibe               → vibeTags[]
 *   Allergènes              → allergens[]
 *   Régime                  → diet[]
 */

import { env } from "@/lib/env";
import type { Recipe } from "@/types/domain/recipe";
import { type NotionPage, queryNotionDatabase } from "./client";
import {
  extractDate,
  extractFirstFileUrl,
  extractMultiSelect,
  extractNumber,
  extractRichText,
  extractSelect,
  extractTitle,
  extractUrl,
} from "./helpers";

/** Lit une image qu'elle soit de type Files (uploadée) ou URL (collée). */
function readImage(prop: unknown): string | undefined {
  // biome-ignore lint/suspicious/noExplicitAny: helpers tolèrent une prop Notion brute
  return extractFirstFileUrl(prop as any) ?? extractUrl(prop as any);
}

/** Mappe une page Notion brute → Recipe. */
function mapNotionRecipe(page: NotionPage): Recipe {
  const props = page.properties;

  const volume = extractNumber(props["Volume final"]);
  const unit = extractSelect(props["Unité de mesure"]);
  const finalVolume = volume != null ? `${volume}${unit ? ` ${unit}` : ""}` : undefined;

  return {
    id: page.id,
    title: extractTitle(props["Nom de la recette"]) ?? "Recette",
    featuredDate: extractDate(props["Date de mise en avant"]),
    photoUrl: readImage(props["Photo principale"]),
    drinkBase: extractSelect(props["Base de la boisson"]),
    drinkType: extractSelect(props["Type de boisson"]),
    temperature: extractSelect(props.Température),
    difficulty: extractSelect(props["Niveau de difficulté"]),
    prepTimeMin: extractNumber(props["temps de préparation"]),
    finalVolume,
    season: extractMultiSelect(props.Saison),
    material: extractMultiSelect(props.Matériel),
    ingredients: extractRichText(props["Ingrédients détaillés"]),
    steps: extractRichText(props["Préparation détaillée"]),
    proTip: extractRichText(props["Astuce Pro"]),
    story: extractRichText(props["Histoire / Inspiration"]),
    author: extractSelect(props["Auteur·rice"]) ?? extractRichText(props["Auteur·rice"]),
    partnerShop:
      extractSelect(props["Coffee shop partenaire"]) ??
      extractRichText(props["Coffee shop partenaire"]),
    vibeTags: extractMultiSelect(props["Tags vibe"]),
    allergens: extractMultiSelect(props.Allergènes),
    diet: extractMultiSelect(props.Régime),
  };
}

/** Récupère toutes les recettes. Caching 1h via tag "notion-recettes". */
export async function fetchRecipes(): Promise<Recipe[]> {
  const pages = await queryNotionDatabase(env.notion.dbRecettes, "notion-recettes");
  return pages.map(mapNotionRecipe);
}

/**
 * Retourne LA recette mise en avant (la plus récente dont la date est passée),
 * ou null si aucune n'est éligible.
 */
export async function getFeaturedRecipe(): Promise<Recipe | null> {
  const all = await fetchRecipes();
  const now = Date.now();

  const eligible = all
    .filter((r) => r.featuredDate && new Date(r.featuredDate).getTime() <= now)
    .sort((a, b) => {
      // featuredDate garanti présent par le filter au-dessus
      const da = new Date(a.featuredDate as string).getTime();
      const db = new Date(b.featuredDate as string).getTime();
      return db - da; // plus récente en premier
    });

  return eligible[0] ?? null;
}
