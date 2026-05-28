/**
 * Zone centrale de la navbar : item principal de la cascade
 * (live Twitch / émission Notion / event Shotgun / fallback)
 * avec dropdown "Agenda" pour voir tous les items à venir.
 *
 * Pattern C : affichage unique + dropdown.
 *
 * Reçoit en props la résolution de la cascade pré-calculée côté serveur
 * (cf. Navbar.tsx qui fait le fetch et passe les props).
 */

"use client";

import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavbarResolution } from "@/lib/cascade/resolve-navbar";
import { cn } from "@/lib/utils";

type NavbarCascadeProps = {
  resolution: NavbarResolution;
};

export function NavbarCascade({ resolution }: NavbarCascadeProps) {
  const { primary, agenda } = resolution;

  if (!primary) {
    return null;
  }

  const showDropdown = primary.kind !== "live" && agenda.length > 1;

  const itemContent = (
    <span className="flex items-center gap-2">
      <span aria-hidden="true" className="text-base">
        {primary.badge}
      </span>
      <span className="flex flex-col items-start text-left leading-tight">
        <span className="text-sm font-semibold uppercase tracking-wide sm:text-base">
          {primary.title}
        </span>
        {primary.subtitle && (
          <span className="text-xs font-medium text-foreground/60 sm:text-sm">
            {primary.subtitle}
          </span>
        )}
      </span>
    </span>
  );

  if (!showDropdown) {
    return (
      <a
        href={primary.url}
        target={primary.kind === "live" ? "_blank" : undefined}
        rel={primary.kind === "live" ? "noopener noreferrer" : undefined}
        className={cn(
          "inline-flex items-center rounded-md transition-opacity hover:opacity-80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {itemContent}
      </a>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-md transition-opacity",
            "hover:opacity-80",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          {itemContent}
          <ChevronDownIcon className="size-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" sideOffset={12} className="min-w-72 max-w-sm">
        {agenda.map((item, index) => (
          <DropdownMenuItem key={`${item.kind}-${item.startTime ?? index}`} asChild>
            <a
              href={item.url}
              target={item.kind === "live" ? "_blank" : undefined}
              rel={item.kind === "live" ? "noopener noreferrer" : undefined}
              className="flex flex-col items-start gap-0.5 py-2"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span aria-hidden="true">{item.badge}</span>
                {item.title}
              </span>
              {item.subtitle && (
                <span className="pl-6 text-xs text-foreground/60">{item.subtitle}</span>
              )}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
