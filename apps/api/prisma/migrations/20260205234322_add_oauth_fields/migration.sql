-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('email', 'google', 'apple');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "oauthId" TEXT,
ADD COLUMN     "oauthProvider" "OAuthProvider" NOT NULL DEFAULT 'email',
ADD COLUMN     "setupCompleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailVerification_userId_verified_idx" ON "EmailVerification"("userId", "verified");

-- CreateIndex
CREATE INDEX "EmailVerification_code_expiresAt_idx" ON "EmailVerification"("code", "expiresAt");

-- CreateIndex
CREATE INDEX "User_oauthProvider_oauthId_idx" ON "User"("oauthProvider", "oauthId");

-- AddForeignKey
ALTER TABLE "EmailVerification" ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
