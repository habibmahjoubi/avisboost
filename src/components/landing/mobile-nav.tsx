"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#probleme", label: "Pourquoi Valoravis" },
  { href: "#comment", label: "Comment ça marche" },
  { href: "#metiers", label: "Pour qui" },
  { href: "#resultats", label: "Résultats" },
  { href: "#temoignages", label: "Témoignages" },
  { href: "#tarifs", label: "Tarifs" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b border-border/40 shadow-lg z-50">
          <nav className="flex flex-col px-5 py-4 gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-border/40 flex gap-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm font-medium py-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm font-semibold brand-gradient text-white py-2.5 rounded-lg"
              >
                Essai gratuit
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
