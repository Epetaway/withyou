-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('active', 'ended');

-- CreateEnum
CREATE TYPE "RelationshipStage" AS ENUM ('dating', 'committed', 'engaged', 'married');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "ActivityStyle" AS ENUM ('chill', 'active', 'surprise');

-- CreateEnum
CREATE TYPE "BudgetLevel" AS ENUM ('low', 'medium', 'high');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "status" "RelationshipStatus" NOT NULL DEFAULT 'active',
    "stage" "RelationshipStage" NOT NULL DEFAULT 'dating',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelationshipInvite" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'pending',
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT,
    "relationshipId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelationshipInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "relationshipId" TEXT,
    "moodLevel" INTEGER NOT NULL,
    "note" TEXT,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "energyLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityStyle" "ActivityStyle" NOT NULL,
    "budgetLevel" "BudgetLevel" NOT NULL,
    "energyLevel" INTEGER NOT NULL,
    "stage" "RelationshipStage" NOT NULL,
    "foodTypes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedIdea" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "relationshipId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "activityStyle" "ActivityStyle",
    "budgetLevel" "BudgetLevel",
    "energyLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedIdea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Relationship_userAId_userBId_key" ON "Relationship"("userAId", "userBId");

-- CreateIndex
CREATE UNIQUE INDEX "RelationshipInvite_code_key" ON "RelationshipInvite"("code");

-- CreateIndex
CREATE INDEX "Checkin_relationshipId_idx" ON "Checkin"("relationshipId");

-- CreateIndex
CREATE UNIQUE INDEX "Preference_userId_key" ON "Preference"("userId");

-- CreateIndex
CREATE INDEX "SavedIdea_relationshipId_idx" ON "SavedIdea"("relationshipId");

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationshipInvite" ADD CONSTRAINT "RelationshipInvite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationshipInvite" ADD CONSTRAINT "RelationshipInvite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationshipInvite" ADD CONSTRAINT "RelationshipInvite_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedIdea" ADD CONSTRAINT "SavedIdea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedIdea" ADD CONSTRAINT "SavedIdea_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE SET NULL ON UPDATE CASCADE;
