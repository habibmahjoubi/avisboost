"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import type { Feature } from "@/config/plan-features";
import { getRequiredPlanLabel } from "@/config/plan-features";

export function UpgradeBadge({
  feature,
  label,
  variant = "inline",
}: {
  feature: Feature;
  label?: string;
  variant?: "inline" | "button";
}) {
  const planLabel = getRequiredPlanLabel(feature);
  const text = label || `Plan ${planLabel} requis`;

  if (variant === "button") {
    return (
      <Link
        href="/dashboard/billing"
        className="mb-6 ml-2 border border-border px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Lock className="w-3.5 h-3.5" />
        {text}
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard/billing"
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
    >
      <Lock className="w-3 h-3" />
      {text}
    </Link>
  );
}
