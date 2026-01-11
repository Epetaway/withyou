/*
  Warnings:

  - You are about to drop the column `activityStyle` on the `SavedIdea` table. All the data in the column will be lost.
  - You are about to drop the column `budgetLevel` on the `SavedIdea` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `SavedIdea` table. All the data in the column will be lost.
  - You are about to drop the column `energyLevel` on the `SavedIdea` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `SavedIdea` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,ideaId]` on the table `SavedIdea` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ideaId` to the `SavedIdea` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IdeaType" AS ENUM ('LOCAL', 'FOOD', 'MOVIE', 'HOME');

-- CreateEnum
CREATE TYPE "IdeaSource" AS ENUM ('CURATED', 'GENERATED', 'USER_SAVED');

-- AlterTable
ALTER TABLE "SavedIdea" DROP COLUMN "activityStyle",
DROP COLUMN "budgetLevel",
DROP COLUMN "description",
DROP COLUMN "energyLevel",
DROP COLUMN "title",
ADD COLUMN     "ideaId" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "type" "IdeaType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "source" "IdeaSource" NOT NULL DEFAULT 'CURATED',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdeaRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "relationshipId" TEXT,
    "type" "IdeaType" NOT NULL,
    "params" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeaRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Idea_type_idx" ON "Idea"("type");

-- CreateIndex
CREATE INDEX "Idea_source_idx" ON "Idea"("source");

-- CreateIndex
CREATE INDEX "IdeaRequest_userId_idx" ON "IdeaRequest"("userId");

-- CreateIndex
CREATE INDEX "IdeaRequest_type_idx" ON "IdeaRequest"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SavedIdea_userId_ideaId_key" ON "SavedIdea"("userId", "ideaId");

-- AddForeignKey
ALTER TABLE "SavedIdea" ADD CONSTRAINT "SavedIdea_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaRequest" ADD CONSTRAINT "IdeaRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaRequest" ADD CONSTRAINT "IdeaRequest_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE SET NULL ON UPDATE CASCADE;
