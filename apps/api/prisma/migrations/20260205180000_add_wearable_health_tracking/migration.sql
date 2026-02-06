-- CreateEnum for DeviceType
CREATE TYPE "DeviceType" AS ENUM ('apple_watch', 'google_watch', 'apple_health', 'google_fit');

-- CreateEnum for ChallengeType
CREATE TYPE "ChallengeType" AS ENUM ('steps', 'heart_rate', 'combined', 'daily_active_minutes');

-- CreateEnum for ChallengeStatus
CREATE TYPE "ChallengeStatus" AS ENUM ('pending', 'active', 'completed', 'declined');

-- CreateTable WearableDevice
CREATE TABLE "WearableDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceType" "DeviceType" NOT NULL,
    "deviceName" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WearableDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable HealthMetric
CREATE TABLE "HealthMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "steps" INTEGER,
    "heartRate" INTEGER,
    "activeMinutes" INTEGER,
    "calories" INTEGER,
    "sleepDuration" INTEGER,
    "rawData" TEXT,
    "syncedFrom" "DeviceType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable ActivityChallenge
CREATE TABLE "ActivityChallenge" (
    "id" TEXT NOT NULL,
    "relationshipId" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "challengeType" "ChallengeType" NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'pending',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetValue" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "reward" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "declinedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable ChallengeProgress
CREATE TABLE "ChallengeProgress" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalSteps" INTEGER NOT NULL DEFAULT 0,
    "avgHeartRate" INTEGER,
    "daysCompleted" INTEGER NOT NULL DEFAULT 0,
    "maxMetricValue" INTEGER,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WearableDevice_userId_idx" ON "WearableDevice"("userId");
CREATE INDEX "WearableDevice_deviceType_idx" ON "WearableDevice"("deviceType");
CREATE UNIQUE INDEX "WearableDevice_userId_deviceType_key" ON "WearableDevice"("userId", "deviceType");

-- CreateIndex
CREATE INDEX "HealthMetric_userId_date_idx" ON "HealthMetric"("userId", "date");
CREATE INDEX "HealthMetric_date_idx" ON "HealthMetric"("date");
CREATE UNIQUE INDEX "HealthMetric_userId_date_key" ON "HealthMetric"("userId", "date");

-- CreateIndex
CREATE INDEX "ActivityChallenge_relationshipId_idx" ON "ActivityChallenge"("relationshipId");
CREATE INDEX "ActivityChallenge_status_idx" ON "ActivityChallenge"("status");
CREATE INDEX "ActivityChallenge_initiatorId_participantId_idx" ON "ActivityChallenge"("initiatorId", "participantId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeProgress_challengeId_userId_key" ON "ChallengeProgress"("challengeId", "userId");
CREATE INDEX "ChallengeProgress_challengeId_idx" ON "ChallengeProgress"("challengeId");

-- AddForeignKey
ALTER TABLE "WearableDevice" ADD CONSTRAINT "WearableDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthMetric" ADD CONSTRAINT "HealthMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityChallenge" ADD CONSTRAINT "ActivityChallenge_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityChallenge" ADD CONSTRAINT "ActivityChallenge_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityChallenge" ADD CONSTRAINT "ActivityChallenge_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeProgress" ADD CONSTRAINT "ChallengeProgress_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "ActivityChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeProgress" ADD CONSTRAINT "ChallengeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
