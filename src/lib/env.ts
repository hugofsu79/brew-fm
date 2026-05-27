/**
 * Lecture & validation des variables d'environnement côté serveur.
 *
 * À importer dans tous les clients de fetch (Shotgun, Notion, Twitch).
 *
 * Ce module crash au démarrage si une variable requise est manquante.
 * Ça évite les bugs en prod où une variable oubliée passerait inaperçue.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

export const env = {
  // Shotgun
  shotgun: {
    orgId: required("SHOTGUN_ORG_ID"),
    key: required("SHOTGUN_KEY"),
  },

  // Notion
  notion: {
    token: required("NOTION_TOKEN"),
    dbArtistes: required("NOTION_DB_ARTISTES_ID"),
    dbLieux: required("NOTION_DB_LIEUX_ID"),
    dbRecettes: required("NOTION_DB_RECETTES_ID"),
    dbEventEnrichments: required("NOTION_DB_EVENT_ENRICHMENTS_ID"),
    dbEmissions: required("NOTION_DB_EMISSIONS_ID"),
  },

  // Twitch (optionnels en V1 tant que le 2FA équipe n'est pas activé)
  twitch: {
    clientId: optional("TWITCH_CLIENT_ID"),
    clientSecret: optional("TWITCH_CLIENT_SECRET"),
    broadcasterId: optional("TWITCH_BROADCASTER_ID"),
  },
} as const;

/**
 * Vérifie si Twitch est configuré.
 * Permet de skip la cascade Twitch tant que l'équipe n'a pas activé le 2FA.
 */
export function isTwitchConfigured(): boolean {
  return Boolean(env.twitch.clientId && env.twitch.clientSecret && env.twitch.broadcasterId);
}
