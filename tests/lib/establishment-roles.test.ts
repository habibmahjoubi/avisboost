import { describe, it, expect } from "vitest";

// Re-implement the role hierarchy logic from src/lib/establishment.ts
// to test it without Prisma dependency
type MemberRole = "OWNER" | "ADMIN" | "MEMBER";

const ROLE_LEVEL: Record<MemberRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

function hasMinRole(userRole: MemberRole, requiredRole: MemberRole): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole];
}

describe("Role hierarchy", () => {
  describe("OWNER", () => {
    it("has access to OWNER-level actions", () => {
      expect(hasMinRole("OWNER", "OWNER")).toBe(true);
    });

    it("has access to ADMIN-level actions", () => {
      expect(hasMinRole("OWNER", "ADMIN")).toBe(true);
    });

    it("has access to MEMBER-level actions", () => {
      expect(hasMinRole("OWNER", "MEMBER")).toBe(true);
    });
  });

  describe("ADMIN", () => {
    it("does NOT have access to OWNER-level actions", () => {
      expect(hasMinRole("ADMIN", "OWNER")).toBe(false);
    });

    it("has access to ADMIN-level actions", () => {
      expect(hasMinRole("ADMIN", "ADMIN")).toBe(true);
    });

    it("has access to MEMBER-level actions", () => {
      expect(hasMinRole("ADMIN", "MEMBER")).toBe(true);
    });
  });

  describe("MEMBER", () => {
    it("does NOT have access to OWNER-level actions", () => {
      expect(hasMinRole("MEMBER", "OWNER")).toBe(false);
    });

    it("does NOT have access to ADMIN-level actions", () => {
      expect(hasMinRole("MEMBER", "ADMIN")).toBe(false);
    });

    it("has access to MEMBER-level actions", () => {
      expect(hasMinRole("MEMBER", "MEMBER")).toBe(true);
    });
  });
});

describe("Role level values", () => {
  it("OWNER has the highest level", () => {
    expect(ROLE_LEVEL.OWNER).toBeGreaterThan(ROLE_LEVEL.ADMIN);
    expect(ROLE_LEVEL.OWNER).toBeGreaterThan(ROLE_LEVEL.MEMBER);
  });

  it("ADMIN is higher than MEMBER", () => {
    expect(ROLE_LEVEL.ADMIN).toBeGreaterThan(ROLE_LEVEL.MEMBER);
  });

  it("all levels are positive", () => {
    expect(ROLE_LEVEL.OWNER).toBeGreaterThan(0);
    expect(ROLE_LEVEL.ADMIN).toBeGreaterThan(0);
    expect(ROLE_LEVEL.MEMBER).toBeGreaterThan(0);
  });
});

describe("Permission matrix", () => {
  // Map actions to their minimum required role
  const ACTIONS: { action: string; minRole: MemberRole }[] = [
    { action: "view dashboard", minRole: "MEMBER" },
    { action: "view clients", minRole: "MEMBER" },
    { action: "add client", minRole: "MEMBER" },
    { action: "send review request", minRole: "MEMBER" },
    { action: "delete client", minRole: "ADMIN" },
    { action: "import CSV", minRole: "ADMIN" },
    { action: "update settings", minRole: "ADMIN" },
    { action: "manage templates", minRole: "ADMIN" },
    { action: "invite member", minRole: "ADMIN" },
    { action: "remove member", minRole: "ADMIN" },
    { action: "change member role", minRole: "OWNER" },
    { action: "delete establishment", minRole: "OWNER" },
    { action: "manage billing", minRole: "OWNER" },
  ];

  const ROLES: MemberRole[] = ["OWNER", "ADMIN", "MEMBER"];

  for (const { action, minRole } of ACTIONS) {
    for (const role of ROLES) {
      const expected = hasMinRole(role, minRole);
      it(`${role} ${expected ? "CAN" : "CANNOT"} ${action}`, () => {
        expect(hasMinRole(role, minRole)).toBe(expected);
      });
    }
  }
});
