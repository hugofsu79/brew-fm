/**
 * Helpers pour extraire les valeurs des propriétés Notion.
 *
 * Le format Notion enveloppe chaque champ dans un objet typé verbeux :
 *   "Nom": { "type": "title", "title": [{ "plain_text": "LINGE" }] }
 *
 * Ces helpers simplifient l'extraction :
 *   extractTitle(properties["Nom"]) → "LINGE"
 *
 * Tous retournent `undefined` si la propriété est absente ou vide,
 * pour faciliter le mapping vers des champs optionnels du domaine.
 */

import type { NotionProperty } from "./client";

type TitleProperty = NotionProperty & {
  type: "title";
  title: Array<{ plain_text?: string }>;
};

type RichTextProperty = NotionProperty & {
  type: "rich_text";
  rich_text: Array<{ plain_text?: string }>;
};

type UrlProperty = NotionProperty & {
  type: "url";
  url: string | null;
};

type NumberProperty = NotionProperty & {
  type: "number";
  number: number | null;
};

type SelectProperty = NotionProperty & {
  type: "select";
  select: { name: string } | null;
};

type MultiSelectProperty = NotionProperty & {
  type: "multi_select";
  multi_select: Array<{ name: string }>;
};

type DateProperty = NotionProperty & {
  type: "date";
  date: { start: string; end?: string | null } | null;
};

type RelationProperty = NotionProperty & {
  type: "relation";
  relation: Array<{ id: string }>;
};

type FileItem =
  | { type: "external"; external: { url: string } }
  | { type: "file"; file: { url: string; expiry_time: string } };

type FilesProperty = NotionProperty & {
  type: "files";
  files: FileItem[];
};

type StatusProperty = NotionProperty & {
  type: "status";
  status: { name: string } | null;
};

/**
 * Extrait le texte brut d'une propriété title.
 */
export function extractTitle(property?: NotionProperty): string | undefined {
  if (property?.type !== "title") return undefined;
  const titleArray = (property as TitleProperty).title;
  const text = titleArray.map((t) => t.plain_text ?? "").join("");
  return text.trim() || undefined;
}

/**
 * Extrait le texte brut d'une propriété rich_text.
 */
export function extractRichText(property?: NotionProperty): string | undefined {
  if (property?.type !== "rich_text") return undefined;
  const richArray = (property as RichTextProperty).rich_text;
  const text = richArray.map((r) => r.plain_text ?? "").join("");
  return text.trim() || undefined;
}

/**
 * Extrait l'URL d'une propriété url.
 */
export function extractUrl(property?: NotionProperty): string | undefined {
  if (property?.type !== "url") return undefined;
  return (property as UrlProperty).url ?? undefined;
}

/**
 * Extrait un nombre d'une propriété number.
 */
export function extractNumber(property?: NotionProperty): number | undefined {
  if (property?.type !== "number") return undefined;
  return (property as NumberProperty).number ?? undefined;
}

/**
 * Extrait le nom d'une option d'une propriété select.
 */
export function extractSelect(property?: NotionProperty): string | undefined {
  if (property?.type !== "select") return undefined;
  return (property as SelectProperty).select?.name;
}

/**
 * Extrait les noms d'options d'une propriété multi_select.
 */
export function extractMultiSelect(property?: NotionProperty): string[] {
  if (property?.type !== "multi_select") return [];
  return (property as MultiSelectProperty).multi_select.map((o) => o.name);
}

/**
 * Extrait la date de début d'une propriété date (ISO 8601).
 */
export function extractDate(property?: NotionProperty): string | undefined {
  if (property?.type !== "date") return undefined;
  return (property as DateProperty).date?.start;
}

/**
 * Extrait les IDs des pages liées d'une propriété relation.
 */
export function extractRelationIds(property?: NotionProperty): string[] {
  if (property?.type !== "relation") return [];
  return (property as RelationProperty).relation.map((r) => r.id);
}

/**
 * Extrait l'URL du premier fichier d'une propriété files.
 *
 * ⚠️ Pour les fichiers uploadés dans Notion (type "file"), l'URL EXPIRE
 * au bout d'1h. À long terme, préférer un type "external" (URL Cloudinary,
 * Dropbox, etc.) côté Notion.
 */
export function extractFirstFileUrl(property?: NotionProperty): string | undefined {
  if (property?.type !== "files") return undefined;
  const files = (property as FilesProperty).files;
  const first = files[0];
  if (!first) return undefined;
  if (first.type === "external") return first.external.url;
  if (first.type === "file") return first.file.url;
  return undefined;
}

/**
 * Extrait le nom d'une propriété status.
 */
export function extractStatus(property?: NotionProperty): string | undefined {
  if (property?.type !== "status") return undefined;
  return (property as StatusProperty).status?.name;
}
