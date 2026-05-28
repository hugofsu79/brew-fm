/**
 * Menu hamburger plein écran (Sheet vert acide).
 *
 * Le bouton hamburger est wrappé dans SheetTrigger pour que Radix gère
 * correctement le cycle ouverture/fermeture (et le retour de focus).
 * Tous les liens et le bouton X utilisent SheetClose pour fermer proprement.
 */

"use client";

import { XIcon } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EXTERNAL_LINKS, INTERNAL_LINKS } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";
import { NavbarLogo } from "./NavbarLogo";
import { NavbarMenuButton } from "./NavbarMenuButton";

const INTERNAL_LINKS_SUBTITLES: Record<string, string> = {
  Radio: "Le live, le stream, le programme",
  Évènements: "Passés + à venir + coffee shops",
  Résidents: "Les résidents + les artistes qui sont venus",
  About: "L'histoire, la vision",
};

export function NavbarMenuPanel() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <NavbarMenuButton className="fixed top-4 left-4 z-50" />
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn("brew-acid w-full max-w-none border-none p-0", "sm:max-w-none")}
      >
        <SheetTitle className="sr-only">Menu de navigation Brew FM</SheetTitle>

        <div className="flex h-full w-full flex-col bg-background text-foreground">
          <header className="flex items-center justify-between p-6">
            <SheetClose asChild>
              <Link
                href="/"
                className="flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <NavbarLogo size={36} />
                <span className="text-xl font-bold tracking-tight">BREW FM</span>
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <button
                type="button"
                aria-label="Fermer le menu"
                className={cn(
                  "inline-flex size-12 items-center justify-center",
                  "rounded-lg transition-opacity",
                  "hover:opacity-70",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                  "active:scale-95",
                )}
              >
                <XIcon className="size-7" strokeWidth={2.5} />
              </button>
            </SheetClose>
          </header>

          <nav className="flex flex-1 flex-col justify-center px-6">
            {INTERNAL_LINKS.map((link, index) => (
              <SheetClose asChild key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "group block py-6 transition-opacity hover:opacity-90",
                    index > 0 && "border-t border-foreground/20",
                  )}
                >
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h2 className="text-5xl font-black tracking-tight uppercase sm:text-7xl md:text-8xl">
                      {link.label}
                    </h2>
                    {INTERNAL_LINKS_SUBTITLES[link.label] && (
                      <p className="text-base font-semibold uppercase tracking-wide text-foreground/60 sm:text-xl md:text-2xl">
                        {INTERNAL_LINKS_SUBTITLES[link.label]}
                      </p>
                    )}
                  </div>
                </Link>
              </SheetClose>
            ))}
          </nav>

          <footer className="flex flex-wrap items-center justify-end gap-6 p-6 sm:gap-10">
            {EXTERNAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "text-sm font-bold uppercase tracking-wider sm:text-base",
                  "transition-opacity hover:opacity-70",
                )}
              >
                {link.label}
              </a>
            ))}
          </footer>
        </div>
      </SheetContent>
    </Sheet>
  );
}
