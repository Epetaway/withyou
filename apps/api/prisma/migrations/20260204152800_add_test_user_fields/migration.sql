-- AlterTable
ALTER TABLE "User" ADD COLUMN "isTestUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "testTag" TEXT;

-- AlterTable
ALTER TABLE "Relationship" ADD COLUMN "isTest" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "User_isTestUser_testTag_idx" ON "User"("isTestUser", "testTag");

-- CreateIndex
CREATE INDEX "Relationship_isTest_idx" ON "Relationship"("isTest");
