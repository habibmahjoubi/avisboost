import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NICHE_CONFIGS } from "@/config/niches";
import { hasFeature } from "@/config/plan-features";
import { formatDate } from "@/lib/utils";
import { OnboardingModal } from "@/components/dashboard/onboarding-modal";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { StatsChart } from "@/components/dashboard/stats-chart";
import { Suspense } from "react";
import {
  Users, Send, MousePointerClick, Star, Stethoscope, Bone, Wrench, Building2,
  Mail, MessageSquare, TrendingUp, MessageCircle, Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Niche } from "@/generated/prisma/enums";

const NICHE_ICONS: Record<Niche, LucideIcon> = {
  DENTIST: Stethoscope,
  OSTEOPATH: Bone,
  GARAGE: Wrench,
  OTHER: Building2,
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ onboard?: string; niche?: string; period?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  if (!user.onboarded || params.onboard === "1") {
    return <OnboardingModal defaultNiche={params.niche || user.niche} defaultBusinessName={user.businessName || ""} />;
  }

  const rawDays = Number(params.period);
  const days = [7, 30, 90].includes(rawDays) ? rawDays : 30;
  const periodStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const periodFilter = { createdAt: { gte: periodStart } };

  const showDetailed = hasFeature(user.plan, "detailed_stats");
  const showAdvanced = hasFeature(user.plan, "advanced_stats");

  const [totalClients, totalSent, totalClicked, totalReviewed, recentRequests] =
    await Promise.all([
      prisma.client.count({ where: { userId: user.id } }),
      prisma.reviewRequest.count({
        where: {
          userId: user.id,
          status: { in: ["SENT", "CLICKED", "REVIEWED"] },
          ...periodFilter,
        },
      }),
      prisma.reviewRequest.count({
        where: {
          userId: user.id,
          status: { in: ["CLICKED", "REVIEWED"] },
          ...periodFilter,
        },
      }),
      prisma.reviewRequest.count({
        where: { userId: user.id, status: "REVIEWED", ...periodFilter },
      }),
      prisma.reviewRequest.findMany({
        where: { userId: user.id, ...periodFilter },
        include: { client: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  // Advanced stats (Pro/Business only)
  let emailSent = 0;
  let smsSent = 0;
  let avgRating: number | null = null;
  let feedbackCount = 0;

  // Chart data: group review requests by day (Business plan only)
  let chartData: { label: string; fullDate: string; monthLabel: string | null; sent: number; clicked: number; reviewed: number }[] = [];

  if (showAdvanced) {
    const allRequestsForChart = await prisma.reviewRequest.findMany({
      where: { userId: user.id, ...periodFilter },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: "asc" },
    });

    const dailyMap = new Map<string, { sent: number; clicked: number; reviewed: number }>();
    for (let d = 0; d < days; d++) {
      const date = new Date(periodStart.getTime() + d * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 10);
      dailyMap.set(key, { sent: 0, clicked: 0, reviewed: 0 });
    }
    for (const req of allRequestsForChart) {
      const key = req.createdAt.toISOString().slice(0, 10);
      const entry = dailyMap.get(key);
      if (!entry) continue;
      if (["SENT", "CLICKED", "REVIEWED"].includes(req.status)) entry.sent++;
      if (["CLICKED", "REVIEWED"].includes(req.status)) entry.clicked++;
      if (req.status === "REVIEWED") entry.reviewed++;
    }
    const MONTHS_SHORT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
    let prevMonth = -1;
    chartData = Array.from(dailyMap.entries()).map(([dateStr, vals]) => {
      const d = new Date(dateStr);
      const day = d.getDate();
      const month = d.getMonth();
      const monthLabel = month !== prevMonth ? MONTHS_SHORT[month] : null;
      prevMonth = month;
      return {
        label: String(day),
        fullDate: `${day} ${MONTHS_SHORT[month]}`,
        monthLabel,
        ...vals,
      };
    });
  }

  if (showDetailed) {
    const [emailC, smsC, ratingAgg, feedbackC] = await Promise.all([
      prisma.reviewRequest.count({
        where: { userId: user.id, channel: "EMAIL", status: { in: ["SENT", "CLICKED", "REVIEWED"] }, ...periodFilter },
      }),
      prisma.reviewRequest.count({
        where: { userId: user.id, channel: "SMS", status: { in: ["SENT", "CLICKED", "REVIEWED"] }, ...periodFilter },
      }),
      prisma.reviewRequest.aggregate({
        where: { userId: user.id, rating: { not: null }, ...periodFilter },
        _avg: { rating: true },
      }),
      prisma.reviewRequest.count({
        where: { userId: user.id, status: "FEEDBACK", ...periodFilter },
      }),
    ]);
    emailSent = emailC;
    smsSent = smsC;
    avgRating = ratingAgg._avg.rating;
    feedbackCount = feedbackC;
  }

  const clickRate =
    totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
  const conversionRate =
    totalSent > 0 ? Math.round((totalReviewed / totalSent) * 100) : 0;
  const nicheConfig = NICHE_CONFIGS[user.niche];
  const vocab = nicheConfig.vocabulary;

  const stats: { label: string; value: string | number; Icon: LucideIcon }[] = [
    { label: vocab.clients.charAt(0).toUpperCase() + vocab.clients.slice(1), value: totalClients, Icon: Users },
    { label: "Envois", value: `${user.quotaUsed}/${user.monthlyQuota}`, Icon: Send },
    { label: "Taux de clic", value: `${clickRate}%`, Icon: MousePointerClick },
    { label: "Avis obtenus", value: totalReviewed, Icon: Star },
  ];

  const detailedStats: { label: string; value: string | number; Icon: LucideIcon }[] = [
    { label: "Envois Email", value: emailSent, Icon: Mail },
    { label: "Envois SMS", value: smsSent, Icon: MessageSquare },
    { label: "Taux conversion", value: `${conversionRate}%`, Icon: TrendingUp },
  ];

  const advancedOnlyStats: { label: string; value: string | number; Icon: LucideIcon }[] = [
    { label: "Note moyenne", value: avgRating ? avgRating.toFixed(1) + "/5" : "—", Icon: Star },
    { label: "Feedbacks reçus", value: feedbackCount, Icon: MessageCircle },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            {(() => { const NIcon = NICHE_ICONS[user.niche]; return <NIcon className="w-6 h-6 text-primary" />; })()}
            {user.businessName || "Mon établissement"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {nicheConfig.label} — Plan {user.plan}
          </p>
        </div>
        <Suspense>
          <PeriodSelector />
        </Suspense>
      </div>

      {/* Basic Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.Icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Detailed Stats (Pro) / Advanced Stats (Business) */}
      {showDetailed ? (
        <div className="mb-8">
          <h2 className="font-semibold mb-4">
            {showAdvanced ? "Statistiques avancées" : "Statistiques détaillées"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {detailedStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <stat.Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            ))}
            {showAdvanced ? (
              advancedOnlyStats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <stat.Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              ))
            ) : (
              <div className="bg-card border border-dashed border-border rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                <Lock className="w-4 h-4 text-muted-foreground mb-1" />
                <a href="/dashboard/billing" className="text-xs text-muted-foreground hover:text-primary">
                  + Stats avancées (Business)
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-4 mb-8 flex items-center gap-3">
          <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Statistiques détaillées disponibles avec le{" "}
            <a href="/dashboard/billing" className="text-primary hover:underline font-medium">plan Pro</a>.
          </p>
        </div>
      )}

      {/* Evolution chart (Business only) */}
      {showAdvanced ? (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-8">
          <h2 className="font-semibold mb-4">
            Évolution ({days} derniers jours)
          </h2>
          <StatsChart data={chartData} />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-4 mb-8 flex items-center gap-3">
          <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Graphique d'évolution disponible avec le{" "}
            <a href="/dashboard/billing" className="text-primary hover:underline font-medium">plan Business</a>.
          </p>
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-4">
          Activité récente ({days} derniers jours)
        </h2>
        {recentRequests.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucune activité sur cette période. Ajoutez des {vocab.clients} et
            envoyez votre première demande d&apos;avis !
          </p>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{req.client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {req.channel} — {formatDate(req.createdAt)}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    PENDING: { label: "En attente", className: "bg-warning/10 text-warning" },
    SENT: { label: "Envoyé", className: "bg-primary/10 text-primary" },
    CLICKED: { label: "Cliqué", className: "bg-success/10 text-success" },
    REVIEWED: {
      label: "Avis laissé",
      className: "bg-success/10 text-success",
    },
    FEEDBACK: {
      label: "Feedback",
      className: "bg-muted text-muted-foreground",
    },
    FAILED: {
      label: "Échoué",
      className: "bg-destructive/10 text-destructive",
    },
  };

  const c = config[status] || config.PENDING;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${c.className}`}
    >
      {c.label}
    </span>
  );
}
