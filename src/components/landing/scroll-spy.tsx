"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const SECTIONS = [
  { id: "probleme", label: "Pourquoi" },
  { id: "comment", label: "Comment" },
  { id: "metiers", label: "Métiers" },
  { id: "resultats", label: "Résultats" },
  { id: "temoignages", label: "Avis" },
  { id: "tarifs", label: "Tarifs" },
];

export function ScrollSpy() {
  const [active, setActive] = useState("");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 600);

      const offset = window.innerHeight / 3;
      let current = "";
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top < offset) {
          current = section.id;
        }
      }
      setActive(current);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Scroll spy dots — desktop only */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="group flex items-center gap-2"
          >
            <span
              className={`text-[11px] font-medium transition-all opacity-0 group-hover:opacity-100 ${
                active === s.id ? "opacity-100 text-primary" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            <span
              className={`block rounded-full transition-all ${
                active === s.id
                  ? "w-3 h-3 bg-primary shadow-sm shadow-primary/30"
                  : "w-2 h-2 bg-border group-hover:bg-muted-foreground"
              }`}
            />
          </a>
        ))}
      </nav>

      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all ${
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Retour en haut"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </>
  );
}
