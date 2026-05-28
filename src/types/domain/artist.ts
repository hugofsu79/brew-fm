/**
 * Artiste Brew FM.
 *
 * Source : base Notion "Artistes".
 * Inclut résidents (LINGE, scolcab...) et invités émissions/events.
 *
 * Le champ shotgunArtistId permet de matcher avec les artistes
 * retournés par l'API Shotgun (clé pivot pour fusionner les line-ups).
 */

export type ArtistStatus = "resident" | "guest";

export type Artist = {
  // Identifiants
  id: string; // Notion page ID (UUID)
  slug: string; // URL-friendly, ex: "linge"

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
  youtube?: string;
  shotgunUrl?: string;

  // CTA principal de la card artiste
  passageBrewUrl?: string; // Lien YouTube du live → CTA card

  // Matching avec Shotgun (pour fusion line-up event)
  shotgunArtistId?: number; // ID Shotgun, ex: 923037 pour LINGE

  // Relations Notion (IDs vers d'autres bases)
  eventIds?: string[];
  episodeIds?: string[];
};
