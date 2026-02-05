import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { QA_TEST_TAG } from "../src/config/qa-constants.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding E2E test database...");

  // Clear existing test data only
  await prisma.savedIdea.deleteMany({
    where: {
      user: {
        isTestUser: true,
        testTag: QA_TEST_TAG,
      },
    },
  });
  await prisma.ideaRequest.deleteMany({
    where: {
      user: {
        isTestUser: true,
        testTag: QA_TEST_TAG,
      },
    },
  });
  await prisma.preference.deleteMany({
    where: {
      user: {
        isTestUser: true,
        testTag: QA_TEST_TAG,
      },
    },
  });
  await prisma.checkin.deleteMany({
    where: {
      user: {
        isTestUser: true,
        testTag: QA_TEST_TAG,
      },
    },
  });
  await prisma.note.deleteMany({
    where: {
      user: {
        isTestUser: true,
        testTag: QA_TEST_TAG,
      },
    },
  });
  await prisma.plan.deleteMany({
    where: {
      user: {
        isTestUser: true,
        testTag: QA_TEST_TAG,
      },
    },
  });
  await prisma.relationshipInvite.deleteMany({
    where: {
      inviter: {
        isTestUser: true,
        testTag: QA_TEST_TAG,
      },
    },
  });
  await prisma.relationship.deleteMany({
    where: {
      isTest: true,
    },
  });
  await prisma.user.deleteMany({
    where: {
      isTestUser: true,
      testTag: QA_TEST_TAG,
    },
  });

  const hashedPassword = await hash("password123", 10);

  // Couple A: qa_alex + qa_jordan (paired)
  const qaAlex = await prisma.user.create({
    data: {
      email: "qa_alex@example.com",
      passwordHash: hashedPassword,
      emailVerified: true,
      isTestUser: true,
      testTag: QA_TEST_TAG,
    },
  });

  const qaJordan = await prisma.user.create({
    data: {
      email: "qa_jordan@example.com",
      passwordHash: hashedPassword,
      emailVerified: true,
      isTestUser: true,
      testTag: QA_TEST_TAG,
    },
  });

  // Couple B: qa_taylor + qa_casey (paired)
  const qaTaylor = await prisma.user.create({
    data: {
      email: "qa_taylor@example.com",
      passwordHash: hashedPassword,
      emailVerified: true,
      isTestUser: true,
      testTag: QA_TEST_TAG,
    },
  });

  const qaCasey = await prisma.user.create({
    data: {
      email: "qa_casey@example.com",
      passwordHash: hashedPassword,
      emailVerified: true,
      isTestUser: true,
      testTag: QA_TEST_TAG,
    },
  });

  // Unpaired: qa_unpaired
  const qaUnpaired = await prisma.user.create({
    data: {
      email: "qa_unpaired@example.com",
      passwordHash: hashedPassword,
      emailVerified: true,
      isTestUser: true,
      testTag: QA_TEST_TAG,
    },
  });

  console.log(`Created QA users: ${qaAlex.email}, ${qaJordan.email}, ${qaTaylor.email}, ${qaCasey.email}, ${qaUnpaired.email}`);

  // Create relationships
  const relationshipA = await prisma.relationship.create({
    data: {
      userAId: qaAlex.id,
      userBId: qaJordan.id,
      status: "active",
      stage: "dating",
      isTest: true,
    },
  });

  const relationshipB = await prisma.relationship.create({
    data: {
      userAId: qaTaylor.id,
      userBId: qaCasey.id,
      status: "active",
      stage: "committed",
      isTest: true,
    },
  });

  console.log("Created test relationships for Couple A and Couple B");

  // Create preferences for all QA users
  await prisma.preference.create({
    data: {
      userId: qaAlex.id,
      activityStyle: "active",
      foodTypes: ["Italian", "Japanese"],
      budgetLevel: "medium",
      energyLevel: 4,
      stage: "dating",
    },
  });

  await prisma.preference.create({
    data: {
      userId: qaJordan.id,
      activityStyle: "chill",
      foodTypes: ["Mexican", "Thai"],
      budgetLevel: "medium",
      energyLevel: 3,
      stage: "dating",
    },
  });

  await prisma.preference.create({
    data: {
      userId: qaTaylor.id,
      activityStyle: "surprise",
      foodTypes: ["French", "Indian"],
      budgetLevel: "high",
      energyLevel: 5,
      stage: "committed",
    },
  });

  await prisma.preference.create({
    data: {
      userId: qaCasey.id,
      activityStyle: "chill",
      foodTypes: ["Mediterranean", "Korean"],
      budgetLevel: "medium",
      energyLevel: 3,
      stage: "committed",
    },
  });

  await prisma.preference.create({
    data: {
      userId: qaUnpaired.id,
      activityStyle: "active",
      foodTypes: ["Italian", "Japanese"],
      budgetLevel: "low",
      energyLevel: 4,
      stage: "dating",
    },
  });

  console.log("Created preferences for all QA users");

  // Create check-ins for coupled users
  await prisma.checkin.create({
    data: {
      userId: qaAlex.id,
      relationshipId: relationshipA.id,
      moodLevel: 4,
      energyLevel: 4,
      moodColor: "#FFD700",
      emotionLabel: "Happy",
      note: "Great day with my partner!",
      shared: true,
    },
  });

  await prisma.checkin.create({
    data: {
      userId: qaJordan.id,
      relationshipId: relationshipA.id,
      moodLevel: 5,
      energyLevel: 5,
      moodColor: "#FF69B4",
      emotionLabel: "Excited",
      note: "Looking forward to our date!",
      shared: true,
    },
  });

  await prisma.checkin.create({
    data: {
      userId: qaTaylor.id,
      relationshipId: relationshipB.id,
      moodLevel: 3,
      energyLevel: 3,
      moodColor: "#87CEEB",
      emotionLabel: "Calm",
      note: "Relaxing weekend together",
      shared: true,
    },
  });

  await prisma.checkin.create({
    data: {
      userId: qaCasey.id,
      relationshipId: relationshipB.id,
      moodLevel: 4,
      energyLevel: 4,
      moodColor: "#98FB98",
      emotionLabel: "Content",
      note: "Enjoying quality time",
      shared: true,
    },
  });

  console.log("Created check-ins for coupled users");

  // Create notes
  await prisma.note.create({
    data: {
      userId: qaAlex.id,
      relationshipId: relationshipA.id,
      type: "TEXT",
      content: "Remember to plan anniversary dinner",
    },
  });

  await prisma.note.create({
    data: {
      userId: qaTaylor.id,
      relationshipId: relationshipB.id,
      type: "TEXT",
      content: "Movie night idea: romantic comedy marathon",
    },
  });

  console.log("Created notes for couples");

  // Create curated ideas for testing
  const testIdeas = [
    {
      id: "qa-local-sunset-hike",
      type: "LOCAL" as const,
      title: "Sunset hiking at Eagle Peak",
      description: "Beautiful 2-hour hike with panoramic views",
      category: "Outdoor",
      source: "CURATED" as const,
      metadata: {
        address: "123 Mountain Road, Denver, CO",
        lat: 39.7392,
        lng: -104.9903,
        distanceMiles: 8.5,
        websiteUrl: "https://example.com/trails/eagle-peak",
        priceLevel: 0,
      },
    },
    {
      id: "qa-local-jazz-night",
      type: "LOCAL" as const,
      title: "Jazz night at Blue Note",
      description: "Live jazz performance in intimate venue",
      category: "Entertainment",
      source: "CURATED" as const,
      metadata: {
        address: "456 Music Lane, Denver, CO",
        lat: 39.7489,
        lng: -104.9898,
        distanceMiles: 2.1,
        websiteUrl: "https://bluenotedenver.com",
        priceLevel: 3,
      },
    },
    {
      id: "qa-food-pasta-carbonara",
      type: "FOOD" as const,
      title: "Homemade Pasta Carbonara",
      description: "Classic Roman pasta with bacon and cream",
      category: "Italian",
      source: "CURATED" as const,
      metadata: {
        ingredients: ["pasta", "eggs", "bacon", "parmesan", "black pepper"],
        recipeUrl: "https://example.com/recipes/carbonara",
        timeMinutes: 25,
        difficulty: "Easy",
      },
    },
    {
      id: "qa-movie-spirited-away",
      type: "MOVIE" as const,
      title: "Spirited Away",
      description: "Acclaimed animated fantasy adventure",
      category: "Animation",
      source: "CURATED" as const,
      metadata: {
        provider: "HBO Max",
        deepLinkUrl: "https://hbomax.com/watch/spirited-away",
        genre: "Animation, Fantasy",
      },
    },
  ];

  for (const idea of testIdeas) {
    await prisma.idea.upsert({
      where: { id: idea.id },
      update: {},
      create: {
        id: idea.id,
        type: idea.type,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        source: idea.source,
        metadata: idea.metadata as Prisma.InputJsonValue,
      },
    });
  }

  console.log(`Seeded ${testIdeas.length} curated ideas`);

  // Create saved ideas
  await prisma.savedIdea.create({
    data: {
      userId: qaAlex.id,
      relationshipId: relationshipA.id,
      ideaId: "qa-local-sunset-hike",
      notes: "Perfect for this weekend!",
    },
  });

  await prisma.savedIdea.create({
    data: {
      userId: qaJordan.id,
      relationshipId: relationshipA.id,
      ideaId: "qa-food-pasta-carbonara",
      notes: "Let's cook together",
    },
  });

  await prisma.savedIdea.create({
    data: {
      userId: qaTaylor.id,
      relationshipId: relationshipB.id,
      ideaId: "qa-local-jazz-night",
      notes: "Book for next Friday",
    },
  });

  await prisma.savedIdea.create({
    data: {
      userId: qaCasey.id,
      relationshipId: relationshipB.id,
      ideaId: "qa-movie-spirited-away",
      notes: "Cozy movie night",
    },
  });

  console.log("Created saved ideas for couples");

  console.log("\n=== QA Test Accounts ===");
  console.log("\nCouple A (Dating):");
  console.log("  qa_alex@example.com / password123");
  console.log("  qa_jordan@example.com / password123");
  console.log("\nCouple B (Committed):");
  console.log("  qa_taylor@example.com / password123");
  console.log("  qa_casey@example.com / password123");
  console.log("\nUnpaired:");
  console.log("  qa_unpaired@example.com / password123");
  console.log("\nAll accounts have testTag: '" + QA_TEST_TAG + "'");
  console.log("\nE2E seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
