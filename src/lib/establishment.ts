import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { MemberRole } from "@/generated/prisma/enums";

const COOKIE_NAME = "current-establishment-id";

export async function getCurrentEstablishmentId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

/**
 * Returns the current establishment for the authenticated user.
 * If no cookie is set or the cookie points to an invalid establishment,
 * falls back to the user's first establishment (as OWNER).
 */
export async function getCurrentEstablishment() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  try {
    const cookieEstId = await getCurrentEstablishmentId();

    // If cookie is set, verify user has access
    if (cookieEstId) {
      const membership = await prisma.establishmentMember.findUnique({
        where: { userId_establishmentId: { userId, establishmentId: cookieEstId } },
        include: { establishment: true },
      });
      if (membership && membership.establishment.isActive) {
        return { ...membership.establishment, role: membership.role };
      }
    }

    // Fallback: first establishment where user is OWNER, then any
    const membership = await prisma.establishmentMember.findFirst({
      where: { userId },
      include: { establishment: true },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }], // OWNER < ADMIN < MEMBER
    });

    if (!membership) return null;

    // Auto-set cookie so we don't repeat this lookup
    try {
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, membership.establishmentId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    } catch {
      // cookies() may fail in some server contexts — non-critical
    }

    return { ...membership.establishment, role: membership.role };
  } catch {
    // Table may not exist yet (pre-migration) — gracefully return null
    return null;
  }
}

/**
 * Verify the user has at least the required role on the given establishment.
 * Role hierarchy: OWNER > ADMIN > MEMBER
 */
const ROLE_LEVEL: Record<MemberRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

export async function requireRole(
  userId: string,
  establishmentId: string,
  minRole: MemberRole = "MEMBER"
) {
  const membership = await prisma.establishmentMember.findUnique({
    where: { userId_establishmentId: { userId, establishmentId } },
  });

  if (!membership) {
    throw new Error("Vous n'avez pas accès à cet établissement.");
  }

  if (ROLE_LEVEL[membership.role] < ROLE_LEVEL[minRole]) {
    throw new Error("Permissions insuffisantes pour cette action.");
  }

  return membership;
}

/**
 * Get the OWNER of an establishment and their plan/quota.
 * Members inherit the OWNER's plan for feature access.
 */
export async function getEstablishmentOwner(establishmentId: string) {
  try {
    const ownerMembership = await prisma.establishmentMember.findFirst({
      where: { establishmentId, role: "OWNER" },
      include: { user: true },
    });
    return ownerMembership?.user ?? null;
  } catch {
    return null;
  }
}

/**
 * Get all establishments the user has access to.
 */
export async function getUserEstablishments(userId: string) {
  try {
    const memberships = await prisma.establishmentMember.findMany({
      where: { userId },
      include: { establishment: true },
      orderBy: [{ role: "asc" }, { establishment: { createdAt: "asc" } }],
    });

    return memberships.map((m) => ({
      ...m.establishment,
      role: m.role,
    }));
  } catch {
    // Table may not exist yet (pre-migration) — return empty
    return [];
  }
}
