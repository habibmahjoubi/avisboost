import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient>;
  prismaVersion: string;
};

// Bump this version when schema changes to invalidate the cached client
const SCHEMA_VERSION = "3";

function makePrisma() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

if (globalForPrisma.prismaVersion !== SCHEMA_VERSION) {
  globalForPrisma.prisma = undefined as unknown as InstanceType<typeof PrismaClient>;
}

export const prisma = globalForPrisma.prisma || makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaVersion = SCHEMA_VERSION;
}
