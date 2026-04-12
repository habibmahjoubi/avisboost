export type PlanKey = "free" | "pro" | "business";

export type Feature =
  | "sms"
  | "csv_import"
  | "custom_templates"
  | "detailed_stats"
  | "advanced_stats"
  | "priority_support";

const PLAN_FEATURES: Record<PlanKey, Set<Feature>> = {
  free: new Set([]),
  pro: new Set(["sms", "custom_templates", "detailed_stats", "csv_import"]),
  business: new Set([
    "sms",
    "csv_import",
    "custom_templates",
    "detailed_stats",
    "advanced_stats",
    "priority_support",
  ]),
};

export const FEATURE_REQUIRED_PLAN: Record<Feature, PlanKey> = {
  sms: "pro",
  custom_templates: "pro",
  detailed_stats: "pro",
  csv_import: "pro",
  advanced_stats: "business",
  priority_support: "business",
};

export const IMPORT_LIMIT: Record<PlanKey, number> = {
  free: 0,
  pro: 100,
  business: 5000,
};

export const ESTABLISHMENT_LIMIT: Record<PlanKey, number> = {
  free: 1,
  pro: 5,
  business: 50,
};

export const MEMBERS_PER_ESTABLISHMENT: Record<PlanKey, number> = {
  free: 1,
  pro: 3,
  business: 999,
};

export function getImportLimit(plan: string): number {
  return IMPORT_LIMIT[plan as PlanKey] ?? 0;
}

export function getEstablishmentLimit(plan: string): number {
  return ESTABLISHMENT_LIMIT[plan as PlanKey] ?? 1;
}

export function getMembersPerEstablishment(plan: string): number {
  return MEMBERS_PER_ESTABLISHMENT[plan as PlanKey] ?? 1;
}

export function hasFeature(plan: string, feature: Feature): boolean {
  const features = PLAN_FEATURES[plan as PlanKey];
  if (!features) return false;
  return features.has(feature);
}

export function getRequiredPlanLabel(feature: Feature): string {
  const labels: Record<PlanKey, string> = {
    free: "Gratuit",
    pro: "Pro",
    business: "Business",
  };
  return labels[FEATURE_REQUIRED_PLAN[feature]];
}
