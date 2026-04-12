import { describe, it, expect } from "vitest";
import { hasFeature, getImportLimit } from "@/config/plan-features";

// Re-implement the effective plan logic from dashboard actions
function getEffectivePlan(
  userRole: string,
  userPlan: string,
  ownerPlan: string | null
): string {
  if (userRole !== "OWNER" && ownerPlan) {
    return ownerPlan;
  }
  return userPlan;
}

describe("Plan inheritance for establishment members", () => {
  describe("OWNER uses their own plan", () => {
    it("OWNER on free plan sees free features", () => {
      const plan = getEffectivePlan("OWNER", "free", null);
      expect(plan).toBe("free");
      expect(hasFeature(plan, "sms")).toBe(false);
    });

    it("OWNER on pro plan sees pro features", () => {
      const plan = getEffectivePlan("OWNER", "pro", null);
      expect(plan).toBe("pro");
      expect(hasFeature(plan, "sms")).toBe(true);
      expect(hasFeature(plan, "advanced_stats")).toBe(false);
    });

    it("OWNER on business plan sees all features", () => {
      const plan = getEffectivePlan("OWNER", "business", null);
      expect(plan).toBe("business");
      expect(hasFeature(plan, "advanced_stats")).toBe(true);
      expect(hasFeature(plan, "priority_support")).toBe(true);
    });
  });

  describe("ADMIN inherits OWNER plan", () => {
    it("ADMIN with free account inherits OWNER pro plan", () => {
      const plan = getEffectivePlan("ADMIN", "free", "pro");
      expect(plan).toBe("pro");
      expect(hasFeature(plan, "sms")).toBe(true);
      expect(hasFeature(plan, "csv_import")).toBe(true);
    });

    it("ADMIN with free account inherits OWNER business plan", () => {
      const plan = getEffectivePlan("ADMIN", "free", "business");
      expect(plan).toBe("business");
      expect(hasFeature(plan, "advanced_stats")).toBe(true);
    });
  });

  describe("MEMBER inherits OWNER plan", () => {
    it("MEMBER with free account inherits OWNER pro plan", () => {
      const plan = getEffectivePlan("MEMBER", "free", "pro");
      expect(plan).toBe("pro");
      expect(hasFeature(plan, "sms")).toBe(true);
    });

    it("MEMBER with free account inherits OWNER business plan", () => {
      const plan = getEffectivePlan("MEMBER", "free", "business");
      expect(plan).toBe("business");
      expect(getImportLimit(plan)).toBe(5000);
    });

    it("MEMBER never uses their own plan when OWNER plan available", () => {
      // Even if member somehow has a pro account, they use owner's plan
      const plan = getEffectivePlan("MEMBER", "pro", "free");
      expect(plan).toBe("free");
      expect(hasFeature(plan, "sms")).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("OWNER with null owner plan uses own plan", () => {
      const plan = getEffectivePlan("OWNER", "pro", null);
      expect(plan).toBe("pro");
    });

    it("MEMBER with null owner plan falls back to own plan", () => {
      // This shouldn't happen in practice but handles gracefully
      const plan = getEffectivePlan("MEMBER", "free", null);
      expect(plan).toBe("free");
    });
  });
});

describe("Feature access by role + plan combination", () => {
  const scenarios = [
    { role: "OWNER", ownerPlan: null, userPlan: "free", feature: "sms" as const, expected: false },
    { role: "OWNER", ownerPlan: null, userPlan: "pro", feature: "sms" as const, expected: true },
    { role: "MEMBER", ownerPlan: "pro", userPlan: "free", feature: "sms" as const, expected: true },
    { role: "MEMBER", ownerPlan: "free", userPlan: "free", feature: "sms" as const, expected: false },
    { role: "ADMIN", ownerPlan: "business", userPlan: "free", feature: "advanced_stats" as const, expected: true },
    { role: "ADMIN", ownerPlan: "pro", userPlan: "free", feature: "advanced_stats" as const, expected: false },
    { role: "MEMBER", ownerPlan: "business", userPlan: "free", feature: "csv_import" as const, expected: true },
    { role: "MEMBER", ownerPlan: "business", userPlan: "free", feature: "priority_support" as const, expected: true },
  ];

  for (const s of scenarios) {
    const label = `${s.role} (own=${s.userPlan}, owner=${s.ownerPlan}) ${s.expected ? "HAS" : "NO"} ${s.feature}`;
    it(label, () => {
      const plan = getEffectivePlan(s.role, s.userPlan, s.ownerPlan);
      expect(hasFeature(plan, s.feature)).toBe(s.expected);
    });
  }
});
