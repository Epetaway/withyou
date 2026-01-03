import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.savedIdea.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.checkin.deleteMany();
  await prisma.relationshipInvite.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const hashedPassword1 = await hash("password123", 10);
  const hashedPassword2 = await hash("password456", 10);

  const user1 = await prisma.user.create({
    data: {
      email: "alice@example.com",
      passwordHash: hashedPassword1,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "bob@example.com",
      passwordHash: hashedPassword2,
    },
  });

  console.log(`Created users: ${user1.email}, ${user2.email}`);

  // Create an active relationship
  const relationship = await prisma.relationship.create({
    data: {
      userAId: user1.id,
      userBId: user2.id,
      status: "active",
      stage: "dating",
    },
  });

  console.log(`Created relationship: ${relationship.id}`);

  // Create preferences for both users
  const _pref1 = await prisma.preference.create({
    data: {
      userId: user1.id,
      activityStyle: "active",
      foodTypes: ["Italian", "Japanese", "Mexican"],
      budgetLevel: "medium",
      energyLevel: 4,
      stage: "dating",
    },
  });

  const _pref2 = await prisma.preference.create({
    data: {
      userId: user2.id,
      activityStyle: "chill",
      foodTypes: ["Italian", "Thai", "Mediterranean"],
      budgetLevel: "medium",
      energyLevel: 3,
      stage: "dating",
    },
  });

  console.log(`Created preferences for both users`);

  // Create some check-ins
  const _checkin1 = await prisma.checkin.create({
    data: {
      userId: user1.id,
      relationshipId: relationship.id,
      moodLevel: 4,
      note: "Had a great day together!",
      shared: true,
    },
  });

  const _checkin2 = await prisma.checkin.create({
    data: {
      userId: user2.id,
      relationshipId: relationship.id,
      moodLevel: 5,
      note: "Feeling great!",
      shared: true,
    },
  });

  console.log(`Created check-ins`);

  // Create saved ideas
  const _idea1 = await prisma.savedIdea.create({
    data: {
      userId: user1.id,
      relationshipId: relationship.id,
      title: "Go hiking at Blue Ridge Trail",
      description: "Beautiful views, moderate difficulty",
      activityStyle: "active",
      budgetLevel: "low",
      energyLevel: 4,
    },
  });

  const _idea2 = await prisma.savedIdea.create({
    data: {
      userId: user2.id,
      relationshipId: relationship.id,
      title: "Cooking class together",
      description: "Italian cuisine class downtown",
      activityStyle: "chill",
      budgetLevel: "medium",
      energyLevel: 2,
    },
  });

  console.log(`Created saved ideas`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
