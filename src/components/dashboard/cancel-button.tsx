"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

export function CancelButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir demander l'annulation de votre abonnement ?\n\nVotre demande sera examinée par notre équipe et prendra effet sous 5 jours ouvrés après validation."
      )
    )
      return;

    setLoading(true);
    const res = await fetch("/api/billing/cancel", { method: "POST" });
    if (res.ok) {
      setDone(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Erreur lors de la demande. Veuillez réessayer.");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="bg-muted border border-border rounded-lg p-3 flex items-start gap-2">
        <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Demande d&apos;annulation envoyée</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Notre équipe examinera votre demande. Vous serez notifié par email de la décision.
          </p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="px-4 py-2 text-sm border border-destructive text-destructive rounded-lg hover:bg-destructive/10 disabled:opacity-50"
    >
      {loading ? "Envoi de la demande..." : "Demander l'annulation"}
    </button>
  );
}
