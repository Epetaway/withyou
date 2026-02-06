import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding development database...");

  // Clear existing data
  await prisma.savedIdea.deleteMany();
  await prisma.ideaRequest.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.checkin.deleteMany();
  await prisma.note.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.relationshipInvite.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await hash("password123", 10);

  // Create minimal dev users
  const dev1 = await prisma.user.create({
    data: {
      email: "dev1@example.com",
      passwordHash: hashedPassword,
      emailVerified: true,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      email: "dev2@example.com",
      passwordHash: hashedPassword,
      emailVerified: true,
    },
  });

  console.log(`Created dev users: ${dev1.email}, ${dev2.email}`);

  // Create a basic relationship for testing
  const devRelationship = await prisma.relationship.create({
    data: {
      userAId: dev1.id,
      userBId: dev2.id,
      status: "active",
      stage: "dating",
    },
  });

  console.log(`Created active relationship: ${devRelationship.id}`);

  // Create wearable devices for development
  const wearable1 = await prisma.wearableDevice.create({
    data: {
      userId: dev1.id,
      deviceType: "apple_watch",
      deviceName: "Apple Watch Series 8",
      accessToken: "dev-apple-token-1",
      isActive: true,
    },
  });

  const wearable2 = await prisma.wearableDevice.create({
    data: {
      userId: dev2.id,
      deviceType: "google_watch",
      deviceName: "Galaxy Watch 6",
      accessToken: "dev-google-token-1",
      isActive: true,
    },
  });

  console.log(`Created wearable devices: ${wearable1.id}, ${wearable2.id}`);

  // Create health metrics for the last 7 days
  const today = new Date();
  const healthData = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    healthData.push(
      {
        userId: dev1.id,
        date,
        steps: 8000 + Math.floor(Math.random() * 3000),
        heartRate: 65 + Math.floor(Math.random() * 20),
        activeMinutes: 45 + Math.floor(Math.random() * 30),
        calories: 2000 + Math.floor(Math.random() * 500),
        sleepDuration: 7 + Math.floor(Math.random() * 2),
        syncedFrom: "apple_watch",
      },
      {
        userId: dev2.id,
        date,
        steps: 10000 + Math.floor(Math.random() * 4000),
        heartRate: 70 + Math.floor(Math.random() * 15),
        activeMinutes: 50 + Math.floor(Math.random() * 35),
        calories: 2200 + Math.floor(Math.random() * 600),
        sleepDuration: 7.5 + Math.floor(Math.random() * 2),
        syncedFrom: "google_watch",
      }
    );
  }

  for (const metric of healthData) {
    await prisma.healthMetric.create({
      data: metric,
    });
  }

  console.log(`Created ${healthData.length} health metrics (7 days × 2 users)`);

  // Create an activity challenge between the two users
  const challenge = await prisma.activityChallenge.create({
    data: {
      challengeType: "steps",
      relationshipId: devRelationship.id,
      initiatorId: dev1.id,
      participantId: dev2.id,
      title: "Daily Steps Challenge",
      description: "Challenge each other to reach 10,000 steps per day",
      targetValue: 10000,
      duration: 30,
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      reward: "Victory bragging rights! 🏆",
    },
  });

  // Create challenge progress for both users
  await prisma.challengeProgress.create({
    data: {
      challengeId: challenge.id,
      userId: dev1.id,
      totalSteps: 60000, // 7 days worth
      avgHeartRate: 72,
      daysCompleted: 6,
      maxMetricValue: 10500,
    },
  });

  await prisma.challengeProgress.create({
    data: {
      challengeId: challenge.id,
      userId: dev2.id,
      totalSteps: 75000, // 7 days worth
      avgHeartRate: 74,
      daysCompleted: 7,
      maxMetricValue: 12000,
    },
  });

  console.log(`Created activity challenge: ${challenge.id}`);


  // Create minimal curated ideas
  const ideas = [
    {
      id: "dev-local-1",
      type: "LOCAL" as const,
      title: "Coffee shop nearby",
      description: "Cozy coffee shop for a casual date",
      category: "Cafe",
      source: "CURATED" as const,
      metadata: {
        address: "123 Main St",
        lat: 39.7392,
        lng: -104.9903,
      },
    },
    {
      id: "dev-food-1",
      type: "FOOD" as const,
      title: "Simple pasta recipe",
      description: "Easy weeknight dinner",
      category: "Italian",
      source: "CURATED" as const,
      metadata: {
        ingredients: ["pasta", "tomatoes", "basil"],
        timeMinutes: 20,
      },
    },
  ];

  for (const idea of ideas) {
    await prisma.idea.create({
      data: {
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

  console.log(`Created ${ideas.length} curated ideas`);

  console.log("\n=== Dev Accounts ===");
  console.log("Dev1: dev1@example.com / password123");
  console.log("Dev2: dev2@example.com / password123");
  console.log("\nDevelopment seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
