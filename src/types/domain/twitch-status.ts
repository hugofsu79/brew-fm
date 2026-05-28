/**
 * Statut Twitch consommé par la navbar (zone droite).
 *
 * Deux états possibles, mutuellement exclusifs :
 *   - `live`    : un stream est EN COURS → badge 🔴 clignotant + redirect chaîne
 *   - `upcoming`: prochain live programmé (date venant de Notion Émissions)
 *
 * Si aucun des deux → la zone Twitch ne s'affiche pas (null côté resolver).
 *
 * IMPORTANT — source des données :
 *   - `live` viendra de l'API Twitch /streams (bloquée tant que la 2FA équipe
 *     n'est pas faite → mockée pour l'instant via getTwitchStatus()).
 *   - `upcoming.startsAt` vient de la base Notion Émissions (colonne "Date émission").
 *     Twitch n'expose PAS de planning via API publique, d'où Notion comme source.
 */

export type TwitchStatus =
  | {
      kind: "live";
      /** Titre du stream en cours (affiché à côté du badge live). */
      title: string;
      /** URL de la chaîne (redirect au click). */
      channelUrl: string;
    }
  | {
      kind: "upcoming";
      /** Nom de l'invité / titre de l'émission à venir. */
      title: string;
      /** Date ISO de début du prochain live (source Notion Émissions). */
      startsAt: string;
      /** URL Twitch (ou chaîne) à ouvrir au click. */
      channelUrl: string;
    };
