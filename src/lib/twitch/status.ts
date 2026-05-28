/**
 * Statut Twitch pour la navbar.
 *
 * ⚠️ MOCK TEMPORAIRE — l'API Twitch nécessite la création d'une app sur
 * dev.twitch.tv/console, bloquée tant que la 2FA équipe n'est pas activée.
 *
 * Quand débloqué :
 *   1. Créer l'app → récupérer TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET (.env.local)
 *   2. Implémenter le vrai fetch :
 *        - OAuth app token (POST https://id.twitch.tv/oauth2/token)
 *        - GET https://api.twitch.tv/helix/streams?user_login=brew_fm
 *   3. Remplacer UNIQUEMENT le corps de getTwitchStatus() ci-dessous.
 *      → la signature ne change pas, donc ZÉRO modif côté UI (NavbarTwitch).
 *
 * La date "upcoming" doit, elle, venir de Notion Émissions (pas de Twitch).
 * Le câblage Notion → upcoming se fera dans resolve-navbar.tsx.
 */

import type { TwitchStatus } from "@/types/domain/twitch-status";

const TWITCH_CHANNEL = "https://twitch.tv/brew_fm";

/**
 * Active/désactive le mock. Passe à `false` pour simuler "rien à venir".
 * À SUPPRIMER une fois le vrai fetch en place.
 */
const MOCK_ENABLED = true;

/**
 * Bascule le scénario de mock pour tester l'UI :
 *   - "live"     → badge 🔴 clignotant
 *   - "upcoming" → countdown (dans 7j ici → countdown actif)
 *   - "none"     → zone masquée
 */
const MOCK_SCENARIO: "live" | "upcoming" | "none" = "upcoming";

/**
 * Retourne le statut Twitch courant, ou null si rien à afficher.
 *
 * Caching cible (vrai fetch) : revalidate 30s côté Next.js.
 */
export async function getTwitchStatus(): Promise<TwitchStatus | null> {
  if (!MOCK_ENABLED) {
    // TODO: vrai fetch Twitch ici (voir en-tête du fichier)
    return null;
  }

  // --- MOCK ---
  if (MOCK_SCENARIO === "live") {
    return {
      kind: "live",
      title: "Émission #12 — DJ set live",
      channelUrl: TWITCH_CHANNEL,
    };
  }

  if (MOCK_SCENARIO === "upcoming") {
    // Prochain live dans 3 jours (→ countdown actif car < 7j)
    const startsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    return {
      kind: "upcoming",
      title: "Émission avec Mathilde",
      startsAt,
      channelUrl: TWITCH_CHANNEL,
    };
  }

  return null;
}
