import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getUserEstablishments, getCurrentEstablishment } from "@/lib/establishment";
import { getEstablishmentLimit, getMembersPerEstablishment } from "@/config/plan-features";
import { NICHE_CONFIGS } from "@/config/niches";
import { AddEstablishmentForm } from "@/components/dashboard/add-establishment-form";
import { EstablishmentCard } from "@/components/dashboard/establishment-card";
import { Building2 } from "lucide-react";

export default async function EstablishmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const establishments = await getUserEstablishments(user.id);
  const currentEst = await getCurrentEstablishment();
  const limit = getEstablishmentLimit(user.plan);
  const membersLimit = getMembersPerEstablishment(user.plan);
  const ownerCount = establishments.filter((e) => e.role === "OWNER").length;
  const isOwner = ownerCount > 0;
  const canCreate = isOwner && ownerCount < limit;

  // Load members for each establishment
  const estIds = establishments.map((e) => e.id);
  const allMembers = estIds.length > 0
    ? await prisma.establishmentMember.findMany({
        where: { establishmentId: { in: estIds } },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      })
    : [];

  // Group members by establishment
  const membersByEst = new Map<string, typeof allMembers>();
  for (const m of allMembers) {
    const list = membersByEst.get(m.establishmentId) || [];
    list.push(m);
    membersByEst.set(m.establishmentId, list);
  }

  // Load pending invitations
  const allInvitations = estIds.length > 0
    ? await prisma.establishmentInvitation.findMany({
        where: { establishmentId: { in: estIds }, expires: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const invitesByEst = new Map<string, typeof allInvitations>();
  for (const inv of allInvitations) {
    const list = invitesByEst.get(inv.establishmentId) || [];
    list.push(inv);
    invitesByEst.set(inv.establishmentId, list);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Établissements
          </h1>
          <p className="text-sm text-muted-foreground">
            {establishments.length} établissement{establishments.length !== 1 ? "s" : ""}
            {isOwner && <> — Limite : {limit} (plan {user.plan})</>}
          </p>
        </div>
      </div>

      {canCreate && <AddEstablishmentForm />}

      {isOwner && !canCreate && (
        <div className="bg-muted/50 border border-border rounded-xl p-4 mb-6 text-sm text-muted-foreground">
          Vous avez atteint la limite de {limit} établissement{limit > 1 ? "s" : ""} pour votre plan.{" "}
          <a href="/dashboard/billing" className="text-primary hover:underline font-medium">
            Passer au plan supérieur
          </a>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {establishments.map((est) => {
          const nicheConfig = NICHE_CONFIGS[est.niche];
          const members = (membersByEst.get(est.id) || []).map((m) => ({
            id: m.id,
            userName: m.user.name,
            userEmail: m.user.email,
            role: m.role,
          }));

          const pendingInvites = (invitesByEst.get(est.id) || []).map((inv) => ({
            id: inv.id,
            email: inv.email,
            role: inv.role,
            expires: inv.expires.toISOString(),
          }));

          return (
            <EstablishmentCard
              key={est.id}
              id={est.id}
              name={est.name}
              niche={nicheConfig.label}
              customNiche={est.customNiche}
              phone={est.phone}
              googlePlaceUrl={est.googlePlaceUrl}
              role={est.role}
              isCurrent={est.id === currentEst?.id}
              isOnlyOne={ownerCount <= 1 && est.role === "OWNER"}
              members={members}
              membersLimit={membersLimit}
              pendingInvites={pendingInvites}
            />
          );
        })}
      </div>

      {establishments.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucun établissement. Créez votre premier ci-dessus.
        </div>
      )}
    </div>
  );
}
