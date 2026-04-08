"use client";

import { useState } from "react";

const NICHES = [
  { value: "DENTIST", label: "Cabinet dentaire" },
  { value: "OSTEOPATH", label: "Ostéopathie" },
  { value: "GARAGE", label: "Garage automobile" },
  { value: "OTHER", label: "Autre métier" },
];

export function NicheSelector({
  defaultNiche,
  defaultCustomNiche,
}: {
  defaultNiche: string;
  defaultCustomNiche: string | null;
}) {
  const [niche, setNiche] = useState(defaultNiche);

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Métier</label>
        <select
          name="niche"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {NICHES.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </select>
      </div>

      {niche === "OTHER" && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Précisez votre métier
          </label>
          <input
            name="customNiche"
            type="text"
            defaultValue={defaultCustomNiche || ""}
            required
            placeholder="Ex: restaurant, salon de coiffure, boulangerie..."
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}
    </>
  );
}
