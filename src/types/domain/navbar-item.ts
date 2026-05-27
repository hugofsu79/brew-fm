/**
 * Item affiché dans la navbar (cascade dynamique).
 *
 * Construit côté serveur par la fonction `resolveNavbarItems()`
 * qui orchestre 3 sources :
 *   1. Live Twitch en cours (priorité absolue)
 *   2. Émissions Notion à venir
 *   3. Évènements Shotgun à venir
 *
 * Fallback si tout est vide : dernier event passé.
 *
 * Pattern UI : affichage unique (le plus prioritaire) + dropdown "Agenda"
 * qui liste tous les items futurs triés chronologiquement.
 */

export type NavbarItemKind =
  | "live" // 🔴 Live Twitch en cours
  | "episode" // 📻 Émission Notion programmée
  | "event" // 🎫 Event Shotgun à venir
  | "past_event"; // ☕ Fallback : dernier event passé

export type NavbarItem = {
  kind: NavbarItemKind;
  badge: string; // Emoji affiché (🔴 📻 🎫 ☕)
  title: string; // Texte principal
  subtitle?: string; // Date formatée ou contexte
  url: string; // CTA (toujours présent)
  startTime?: string; // ISO 8601, pour tri dans le dropdown
};
