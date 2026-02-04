import { PrismaClient } from "@prisma/client";
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
        metadata: idea.metadata as unknown,
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
