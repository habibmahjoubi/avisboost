/**
 * Data migration script: creates one Establishment per existing onboarded User
 * and links their Clients, ReviewRequests, Templates.
 *
 * Run with: npx tsx prisma/migrate-data.ts
 */
import "dotenv/config";

async function main() {
  // Dynamic import to ensure env is loaded first
  const { PrismaClient } = await import("../src/generated/prisma/client.js");
  const { PrismaPg } = await import("@prisma/adapter-pg");

  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const users = await prisma.user.findMany({
    where: { onboarded: true },
  });

  console.log(`Found ${users.length} onboarded users to migrate`);

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    // Check if user already has an establishment
    const existing = await prisma.establishmentMember.findFirst({
      where: { userId: user.id, role: "OWNER" },
    });

    if (existing) {
      console.log(`  SKIP ${user.email} — already has establishment`);
      skipped++;
      continue;
    }

    // Create establishment from user data
    const establishment = await prisma.establishment.create({
      data: {
        name: user.businessName || user.email,
        niche: user.niche,
        customNiche: user.customNiche,
        googlePlaceUrl: user.googlePlaceUrl,
        phone: user.phone,
        satisfactionThreshold: user.satisfactionThreshold,
        defaultChannel: user.defaultChannel,
        defaultDelay: user.defaultDelay,
        senderName: user.senderName,
        replyToEmail: user.replyToEmail,
        members: {
          create: { userId: user.id, role: "OWNER" },
        },
      },
    });

    // Link clients
    const clientResult = await prisma.client.updateMany({
      where: { userId: user.id, establishmentId: null },
      data: { establishmentId: establishment.id },
    });

    // Link review requests
    const rrResult = await prisma.reviewRequest.updateMany({
      where: { userId: user.id, establishmentId: null },
      data: { establishmentId: establishment.id },
    });

    // Link templates
    const tplResult = await prisma.template.updateMany({
      where: { userId: user.id, establishmentId: null },
      data: { establishmentId: establishment.id },
    });

    console.log(
      `  OK ${user.email} → "${establishment.name}" (${clientResult.count} clients, ${rrResult.count} requests, ${tplResult.count} templates)`
    );
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
