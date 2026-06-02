/**
 * Artiste Brew FM.
 *
 * Source : base Notion "Artistes".
 * Inclut résidents (LINGE, scolcab...) et invités émissions/events.
 *
 * Le champ shotgunArtistId permet de matcher avec les artistes
 * retournés par l'API Shotgun (clé pivot pour fusionner les line-ups).
 *
 * Les passages YouTube (passageVideos) sont DÉRIVÉS par le mapper :
 *   - depuis la relation Notion "Émissions" → Youtube Interview/DJ Set URL
 *   - depuis la relation Notion "Évènements" → Youtube URL d'Event Enrichments
 *   → ils ne vivent PAS sur la fiche artiste dans Notion.
 */

export type ArtistStatus = "resident" | "guest";

/**
 * Un passage chez Brew FM avec sa/ses vidéo(s).
 * Une émission a typiquement 2 URLs (interview + DJ set).
 * Un event a typiquement 1 URL (aftermovie/recap).
 */
export type ArtistPassageVideo = {
  type: "episode" | "event";
  sourceName: string; // "Émission #12" ou "Club Latte by Brew FM"
  date: string; // ISO 8601 — pour trier
  urls: string[]; // 1 ou 2 (interview + DJ set pour émissions)
};

export type Artist = {
  // Identifiants
  id: string; // Notion page ID (UUID)
  slug: string; // Slugifié depuis le nom, ex: "linge", "d-a-n-g"

  // Champs obligatoires
  name: string; // ex: "LINGE"
  status: ArtistStatus; // 🌟 Résident OU 👤 Invité

  // Photos (URLs externes, à terme — pas l'API Notion Files qui expire)
  photoUrl?: string; // Carré, pour cards/grille
  coverUrl?: string; // Paysage, pour résidents

  // Contenu éditorial
  bioShort?: string;
  bioLong?: string; // Résidents seulement (V2)

  // Métadonnées
  genres?: string[];
  arrivedAt?: string; // ISO date, résidents

  // Liens sociaux
  instagram?: string;
  soundcloud?: string;
  spotify?: string;
  linktree?: string;
  tiktok?: string;
  youtube?: string; // Résidents uniquement (V1)
  shotgunUrl?: string;

  // Passages chez Brew FM (dérivés des relations Notion, triés date desc)
  passageVideos: ArtistPassageVideo[];

  // Matching avec Shotgun (pour fusion line-up event)
  shotgunArtistId?: number; // ID Shotgun, ex: 923037 pour LINGE

  // Relations Notion (IDs vers d'autres bases) — utiles pour debug & V2
  eventIds?: string[];
  episodeIds?: string[];
};
