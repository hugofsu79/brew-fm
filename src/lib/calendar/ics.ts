/**
 * Génération d'événements calendrier — universel.
 *
 * - buildIcs()              → contenu .ics (Apple Calendar, Outlook, importable partout)
 * - buildGoogleCalendarUrl() → URL d'ajout direct Google Agenda
 * - downloadIcs()           → déclenche le téléchargement du .ics côté client
 *
 * Le .ics est le format standard (RFC 5545) lu par Apple, Outlook, Thunderbird,
 * etc. Google ouvre mieux via son URL render, d'où les deux options.
 */

export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  description?: string;
  url?: string;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Formate une date en UTC au format iCal : YYYYMMDDTHHMMSSZ. */
export function formatIcsDate(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/** Échappe les caractères spéciaux iCal (virgule, point-virgule, retour ligne). */
function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Construit le contenu d'un fichier .ics pour un événement. */
export function buildIcs(event: CalendarEvent): string {
  const uid = `${formatIcsDate(event.start)}-brewfm@brewfm`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Brew FM//Live//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(event.start)}`,
    `DTEND:${formatIcsDate(event.end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    event.description ? `DESCRIPTION:${escapeIcs(event.description)}` : "",
    event.url ? `URL:${event.url}` : "",
    event.url ? `LOCATION:${escapeIcs(event.url)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/** Construit une URL d'ajout direct à Google Agenda. */
export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatIcsDate(event.start)}/${formatIcsDate(event.end)}`,
    details: event.description ?? "",
    location: event.url ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Déclenche le téléchargement d'un .ics côté client (Blob + lien temporaire). */
export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
