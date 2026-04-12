"use client";

import { useState, useTransition } from "react";
import { createEstablishment } from "@/actions/establishments";
import { Plus, X } from "lucide-react";

const NICHES = [
  { value: "DENTIST", label: "Cabinet dentaire" },
  { value: "OSTEOPATH", label: "Ostéopathie" },
  { value: "GARAGE", label: "Garage auto" },
  { value: "OTHER", label: "Autre" },
];

export function AddEstablishmentForm() {
  const [open, setOpen] = useState(false);
  const [niche, setNiche] = useState("DENTIST");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 mb-6"
      >
        <Plus className="w-4 h-4" />
        Ajouter un établissement
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Nouvel établissement</h2>
        <button onClick={() => { setOpen(false); setError(null); }} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form
        action={(formData) => {
          startTransition(async () => {
            const result = await createEstablishment(formData);
            if (result?.error) {
              setError(result.error);
            } else {
              setOpen(false);
              setError(null);
            }
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            name="name"
            required
            placeholder="Cabinet Dentaire du Parc"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Métier</label>
          <select
            name="niche"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            {NICHES.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </div>

        {niche === "OTHER" && (
          <div>
            <label className="block text-sm font-medium mb-1">Métier personnalisé</label>
            <input
              name="customNiche"
              required
              placeholder="Restaurant, Coiffeur..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">URL Google Maps (optionnel)</label>
          <input
            name="googlePlaceUrl"
            type="url"
            placeholder="https://maps.google.com/..."
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Téléphone (optionnel)</label>
          <input
            name="phone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Création..." : "Créer l'établissement"}
        </button>
      </form>
    </div>
  );
}
