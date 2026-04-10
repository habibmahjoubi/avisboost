"use client";

import { useState } from "react";
import { updateUserPlan } from "@/actions/admin";

const PLANS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
];

export function ChangePlanForm({
  userId,
  currentPlan,
}: {
  userId: string;
  currentPlan: string;
  currentQuota?: number;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded text-xs font-medium bg-muted hover:bg-muted/80"
      >
        {currentPlan}
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await updateUserPlan(formData);
        setOpen(false);
      }}
      className="inline-flex flex-wrap items-center gap-1"
    >
      <input type="hidden" name="userId" value={userId} />
      <select
        name="plan"
        defaultValue={currentPlan}
        className="px-2 py-1.5 border border-border rounded text-xs bg-card"
      >
        {PLANS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="px-2.5 py-1.5 rounded text-xs bg-primary text-primary-foreground"
      >
        OK
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-2.5 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground"
      >
        x
      </button>
    </form>
  );
}
