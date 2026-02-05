import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.savedIdea.deleteMany();
  await prisma.ideaRequest.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.checkin.deleteMany();
  await prisma.relationshipInvite.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.user.deleteMany();

  // Create test users with various scenarios
  const hashedPassword = await hash("password123", 10);

  // Paired users (Alice & Bob)
  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      passwordHash: hashedPassword,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      passwordHash: hashedPassword,
    },
  });

  // Unpaired users (for testing pairing flow)
  const charlie = await prisma.user.create({
    data: {
      email: "charlie@example.com",
      passwordHash: hashedPassword,
    },
  });

  const diana = await prisma.user.create({
    data: {
      email: "diana@example.com",
      passwordHash: hashedPassword,
    },
  });

  // Additional unpaired users for beta invites
  const emma = await prisma.user.create({
    data: {
      email: "emma@example.com",
      passwordHash: hashedPassword,
    },
  });

  const frank = await prisma.user.create({
    data: {
      email: "frank@example.com",
      passwordHash: hashedPassword,
    },
  });

  // Pre-paired beta test couple
  const beta1 = await prisma.user.create({
    data: {
      email: "beta1@example.com",
      passwordHash: hashedPassword,
    },
  });

  const beta2 = await prisma.user.create({
    data: {
      email: "beta2@example.com",
      passwordHash: hashedPassword,
    },
  });

  console.log(`Created users: ${alice.email}, ${bob.email}, ${charlie.email}, ${diana.email}, ${emma.email}, ${frank.email}, ${beta1.email}, ${beta2.email}`);

  // Create active relationships (Alice & Bob, Charlie & Diana)
  const relationship = await prisma.relationship.create({
    data: {
      userAId: alice.id,
      userBId: bob.id,
      status: "active",
      stage: "dating",
    },
  });

  const relationship2 = await prisma.relationship.create({
    data: {
      userAId: charlie.id,
      userBId: diana.id,
      status: "active",
      stage: "dating",
    },
  });

  const relationship3 = await prisma.relationship.create({
    data: {
      userAId: beta1.id,
      userBId: beta2.id,
      status: "active",
      stage: "committed",
    },
  });

  console.log(`Created active relationships: Alice & Bob, Charlie & Diana`);

  // Create preferences for paired users
  const _prefAlice = await prisma.preference.create({
    data: {
      userId: alice.id,
      activityStyle: "active",
      foodTypes: ["Italian", "Japanese", "Mexican"],
      budgetLevel: "medium",
      energyLevel: 4,
      stage: "dating",
    },
  });

  const _prefBob = await prisma.preference.create({
    data: {
      userId: bob.id,
      activityStyle: "chill",
      foodTypes: ["Italian", "Thai", "Mediterranean"],
      budgetLevel: "medium",
      energyLevel: 3,
      stage: "dating",
    },
  });

  // Create preferences for unpaired users
  const _prefCharlie = await prisma.preference.create({
    data: {
      userId: charlie.id,
      activityStyle: "surprise",
      foodTypes: ["Vietnamese", "Korean", "Indian"],
      budgetLevel: "high",
      energyLevel: 5,
      stage: "dating",
    },
  });

  const _prefDiana = await prisma.preference.create({
    data: {
      userId: diana.id,
      activityStyle: "chill",
      foodTypes: ["Mediterranean", "French", "Spanish"],
      budgetLevel: "low",
      energyLevel: 2,
      stage: "dating",
    },
  });

  // Preferences for pre-paired beta couple
  const _prefBeta1 = await prisma.preference.create({
    data: {
      userId: beta1.id,
      activityStyle: "active",
      foodTypes: ["Japanese", "Mexican"],
      budgetLevel: "medium",
      energyLevel: 4,
      stage: "committed",
    },
  });

  const _prefBeta2 = await prisma.preference.create({
    data: {
      userId: beta2.id,
      activityStyle: "chill",
      foodTypes: ["Italian", "Thai"],
      budgetLevel: "medium",
      energyLevel: 3,
      stage: "committed",
    },
  });

  // Preferences for new beta users (unpaired)
  const _prefEmma = await prisma.preference.create({
    data: {
      userId: emma.id,
      activityStyle: "active",
      foodTypes: ["Italian", "Mexican"],
      budgetLevel: "medium",
      energyLevel: 4,
      stage: "dating",
    },
  });

  const _prefFrank = await prisma.preference.create({
    data: {
      userId: frank.id,
      activityStyle: "chill",
      foodTypes: ["Thai", "Japanese"],
      budgetLevel: "low",
      energyLevel: 2,
      stage: "dating",
    },
  });

  console.log(`Created preferences for all users`);

  // Create check-ins for paired users
  const _checkinAlice = await prisma.checkin.create({
    data: {
      userId: alice.id,
      relationshipId: relationship.id,
      moodLevel: 4,
      note: "Had a great day together!",
      shared: true,
    },
  });

  const _checkinBob = await prisma.checkin.create({
    data: {
      userId: bob.id,
      relationshipId: relationship.id,
      moodLevel: 5,
      note: "Feeling amazing!",
      shared: true,
    },
  });

  const _checkinCharlie = await prisma.checkin.create({
    data: {
      userId: charlie.id,
      relationshipId: relationship2.id,
      moodLevel: 3,
      note: "Looking forward to our next adventure",
      shared: true,
    },
  });

  const _checkinDiana = await prisma.checkin.create({
    data: {
      userId: diana.id,
      relationshipId: relationship2.id,
      moodLevel: 4,
      note: "Great week so far!",
      shared: true,
    },
  });

  const _checkinBeta1 = await prisma.checkin.create({
    data: {
      userId: beta1.id,
      relationshipId: relationship3.id,
      moodLevel: 5,
      note: "Feeling very connected today",
      shared: true,
    },
  });

  const _checkinBeta2 = await prisma.checkin.create({
    data: {
      userId: beta2.id,
      relationshipId: relationship3.id,
      moodLevel: 4,
      note: "Had a relaxing evening together",
      shared: true,
    },
  });

  console.log(`Created check-ins for all paired users`);

  // Curated ideas catalog
  const curatedLocalIdeas = [
    {
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
      type: "LOCAL" as const,
      title: "Farmer's market Sunday",
      description: "Fresh local produce and artisan goods",
      category: "Shopping",
      source: "CURATED" as const,
      metadata: {
        address: "789 Market Street, Denver, CO",
        lat: 39.7505,
        lng: -104.9706,
        distanceMiles: 1.5,
        websiteUrl: "https://example.com/farmers-market",
        priceLevel: 1,
      },
    },
  ];

  const curatedRecipes = [
    {
      type: "FOOD" as const,
      title: "Homemade Pasta Carbonara",
      description: "Classic Roman pasta with bacon and cream",
      category: "Italian",
      source: "CURATED" as const,
      metadata: {
        ingredients: ["pasta", "eggs", "bacon", "parmesan", "black pepper"],
        missingIngredients: [],
        recipeUrl: "https://example.com/recipes/carbonara",
        timeMinutes: 25,
        difficulty: "Easy",
      },
    },
    {
      type: "FOOD" as const,
      title: "Stir-fry with vegetables",
      description: "Quick and healthy Asian-inspired meal",
      category: "Asian",
      source: "CURATED" as const,
      metadata: {
        ingredients: ["bell pepper", "broccoli", "soy sauce", "garlic", "rice"],
        missingIngredients: [],
        recipeUrl: "https://example.com/recipes/stirfry",
        timeMinutes: 20,
        difficulty: "Easy",
      },
    },
    {
      type: "FOOD" as const,
      title: "Chocolate chip cookies",
      description: "Classic homemade cookies",
      category: "Dessert",
      source: "CURATED" as const,
      metadata: {
        ingredients: ["flour", "butter", "eggs", "chocolate chips", "vanilla"],
        missingIngredients: [],
        recipeUrl: "https://example.com/recipes/cookies",
        timeMinutes: 30,
        difficulty: "Easy",
      },
    },
  ];

  const curatedMovies = [
    {
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
    {
      type: "MOVIE" as const,
      title: "Inception",
      description: "Mind-bending sci-fi thriller",
      category: "Sci-Fi",
      source: "CURATED" as const,
      metadata: {
        provider: "Netflix",
        deepLinkUrl: "https://netflix.com/watch/inception",
        genre: "Sci-Fi, Thriller",
      },
    },
    {
      type: "MOVIE" as const,
      title: "The Grand Budapest Hotel",
      description: "Wes Anderson masterpiece",
      category: "Comedy",
      source: "CURATED" as const,
      metadata: {
        provider: "Amazon Prime",
        deepLinkUrl: "https://primevideo.com/watch/budapest",
        genre: "Comedy, Drama",
      },
    },
  ];

  // Seed curated ideas into Idea table
  const allCurated = [...curatedLocalIdeas, ...curatedRecipes, ...curatedMovies];
  for (const idea of allCurated) {
    const slugId = idea.title.replace(/\s+/g, "-").toLowerCase();
    await prisma.idea.upsert({
      where: { id: slugId },
      update: {},
      create: {
        id: slugId,
        type: idea.type,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        source: idea.source,
        metadata: idea.metadata as Prisma.InputJsonValue,
      },
    });
  }

  console.log(`Seeded curated ideas catalog (${allCurated.length} items)`);

  // Create saved ideas for paired users (linking to curated catalog)
  const pickIdea = (idx: number) => {
    const idea = allCurated[idx % allCurated.length];
    const slugId = idea?.title.replace(/\s+/g, "-").toLowerCase();
    return slugId || "";
  };

  await prisma.savedIdea.create({
    data: {
      userId: alice.id,
      relationshipId: relationship.id,
      ideaId: pickIdea(0),
      notes: "Looks fun for this weekend",
    },
  });

  await prisma.savedIdea.create({
    data: {
      userId: bob.id,
      relationshipId: relationship.id,
      ideaId: pickIdea(4),
      notes: "Let's book tickets",
    },
  });

  await prisma.savedIdea.create({
    data: {
      userId: charlie.id,
      relationshipId: relationship2.id,
      ideaId: pickIdea(1),
      notes: "Add to our shortlist",
    },
  });

  await prisma.savedIdea.create({
    data: {
      userId: diana.id,
      relationshipId: relationship2.id,
      ideaId: pickIdea(5),
      notes: "Cozy night in",
    },
  });

  await prisma.savedIdea.create({
    data: {
      userId: beta1.id,
      relationshipId: relationship3.id,
      ideaId: pickIdea(2),
      notes: "Date night idea",
    },
  });

  await prisma.savedIdea.create({
    data: {
      userId: beta2.id,
      relationshipId: relationship3.id,
      ideaId: pickIdea(6),
      notes: "Try this recipe",
    },
  });

  console.log(`Created saved ideas for all paired users`);

  console.log("\n=== Test Accounts ===");
  console.log("\n✅ PAIRED USERS - Alice & Bob:");
  console.log(`   Alice: alice@example.com / password123`);
  console.log(`   Bob:   bob@example.com / password123`);
  console.log("\n✅ PAIRED USERS - Charlie & Diana:");
  console.log(`   Charlie: charlie@example.com / password123`);
  console.log(`   Diana:   diana@example.com / password123`);
  console.log("\n✅ PAIRED USERS - Beta1 & Beta2:");
  console.log(`   Beta1: beta1@example.com / password123`);
  console.log(`   Beta2: beta2@example.com / password123`);
  console.log("\n⏳ UNPAIRED USERS - For invite testing:");
  console.log(`   Emma: emma@example.com / password123`);
  console.log(`   Frank: frank@example.com / password123`);
  console.log("\n=== Features Ready to Test ===");
  console.log("✓ Login/Register");
  console.log("✓ Dashboard with partner mood");
  console.log("✓ Check-in creation with mood picker");
  console.log("✓ Preferences management");
  console.log("✓ Ideas feed with save/share");
  console.log("✓ Pairing flow (invite/accept)");
  console.log("✓ Dark/light mode toggle");
  console.log("✓ Settings & logout");
  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
