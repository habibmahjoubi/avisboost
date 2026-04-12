-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "Establishment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "niche" "Niche" NOT NULL DEFAULT 'DENTIST',
    "customNiche" TEXT,
    "googlePlaceUrl" TEXT,
    "phone" TEXT,
    "satisfactionThreshold" INTEGER NOT NULL DEFAULT 4,
    "defaultChannel" "Channel" NOT NULL DEFAULT 'EMAIL',
    "defaultDelay" INTEGER,
    "senderName" TEXT,
    "replyToEmail" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Establishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstablishmentMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstablishmentMember_pkey" PRIMARY KEY ("id")
);

-- Add establishmentId to existing tables
ALTER TABLE "Client" ADD COLUMN "establishmentId" TEXT;
ALTER TABLE "ReviewRequest" ADD COLUMN "establishmentId" TEXT;
ALTER TABLE "Template" ADD COLUMN "establishmentId" TEXT;

-- CreateIndex
CREATE INDEX "EstablishmentMember_userId_idx" ON "EstablishmentMember"("userId");
CREATE INDEX "EstablishmentMember_establishmentId_idx" ON "EstablishmentMember"("establishmentId");
CREATE UNIQUE INDEX "EstablishmentMember_userId_establishmentId_key" ON "EstablishmentMember"("userId", "establishmentId");

CREATE INDEX "Client_establishmentId_idx" ON "Client"("establishmentId");
CREATE INDEX "ReviewRequest_establishmentId_idx" ON "ReviewRequest"("establishmentId");
CREATE INDEX "Template_establishmentId_idx" ON "Template"("establishmentId");

-- AddForeignKey
ALTER TABLE "EstablishmentMember" ADD CONSTRAINT "EstablishmentMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EstablishmentMember" ADD CONSTRAINT "EstablishmentMember_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Client" ADD CONSTRAINT "Client_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReviewRequest" ADD CONSTRAINT "ReviewRequest_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Template" ADD CONSTRAINT "Template_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate existing data: create one Establishment per User with business data
INSERT INTO "Establishment" ("id", "name", "niche", "customNiche", "googlePlaceUrl", "phone", "satisfactionThreshold", "defaultChannel", "defaultDelay", "senderName", "replyToEmail", "isActive", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    COALESCE("businessName", "email"),
    "niche",
    "customNiche",
    "googlePlaceUrl",
    "phone",
    "satisfactionThreshold",
    "defaultChannel",
    "defaultDelay",
    "senderName",
    "replyToEmail",
    true,
    "createdAt",
    NOW()
FROM "User"
WHERE "onboarded" = true;

-- Create OWNER membership for each user → their establishment
INSERT INTO "EstablishmentMember" ("id", "userId", "establishmentId", "role", "createdAt")
SELECT
    gen_random_uuid()::text,
    u."id",
    e."id",
    'OWNER',
    NOW()
FROM "User" u
JOIN "Establishment" e ON e."name" = COALESCE(u."businessName", u."email")
    AND e."niche" = u."niche"
    AND e."createdAt" = u."createdAt"
WHERE u."onboarded" = true;

-- Link existing clients to their owner's establishment
UPDATE "Client" c
SET "establishmentId" = em."establishmentId"
FROM "EstablishmentMember" em
WHERE em."userId" = c."userId" AND em."role" = 'OWNER';

-- Link existing review requests to their owner's establishment
UPDATE "ReviewRequest" rr
SET "establishmentId" = em."establishmentId"
FROM "EstablishmentMember" em
WHERE em."userId" = rr."userId" AND em."role" = 'OWNER';

-- Link existing templates to their owner's establishment
UPDATE "Template" t
SET "establishmentId" = em."establishmentId"
FROM "EstablishmentMember" em
WHERE em."userId" = t."userId" AND em."role" = 'OWNER';
