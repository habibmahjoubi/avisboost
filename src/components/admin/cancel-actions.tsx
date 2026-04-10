"use client";

import { approveCancellation, rejectCancellation } from "@/actions/admin";

export function CancelActions({ userId }: { userId: string }) {
  return (
    <div className="inline-flex gap-1">
      <button
        onClick={() => {
          if (confirm("Approuver l'annulation ? Effectif dans 5 jours ouvrés.")) {
            approveCancellation(userId);
          }
        }}
        className="px-2.5 py-1 rounded text-xs bg-warning/10 text-warning hover:bg-warning/20"
      >
        Approuver
      </button>
      <button
        onClick={() => {
          if (confirm("Rejeter la demande d'annulation ?")) {
            rejectCancellation(userId);
          }
        }}
        className="px-2.5 py-1 rounded text-xs bg-success/10 text-success hover:bg-success/20"
      >
        Rejeter
      </button>
    </div>
  );
}
