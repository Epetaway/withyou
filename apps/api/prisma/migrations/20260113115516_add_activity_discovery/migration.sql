-- CreateEnum
CREATE TYPE "MoodState" AS ENUM ('energetic', 'calm', 'playful', 'romantic', 'adventurous', 'relaxed', 'stressed', 'happy');

-- CreateEnum
CREATE TYPE "TimeOfDay" AS ENUM ('morning', 'afternoon', 'evening', 'night');

-- CreateEnum
CREATE TYPE "WeatherPreference" AS ENUM ('indoor', 'outdoor', 'any');

-- CreateTable
CREATE TABLE "MoodCheckin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moodState" "MoodState" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dietaryRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hasChildren" BOOLEAN NOT NULL DEFAULT false,
    "accessibilityNeeds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "budgetLevel" "BudgetLevel" NOT NULL DEFAULT 'medium',
    "maxDistance" INTEGER NOT NULL DEFAULT 10,
    "preferredTimeOfDay" "TimeOfDay"[] DEFAULT ARRAY[]::"TimeOfDay"[],
    "weatherPreference" "WeatherPreference" NOT NULL DEFAULT 'any',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MoodCheckin_userId_createdAt_idx" ON "MoodCheckin"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityPreferences_userId_key" ON "ActivityPreferences"("userId");

-- AddForeignKey
ALTER TABLE "MoodCheckin" ADD CONSTRAINT "MoodCheckin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityPreferences" ADD CONSTRAINT "ActivityPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
