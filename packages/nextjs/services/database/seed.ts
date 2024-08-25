import { grants, privateNotes, stages, users } from "./config/schema";
import * as schema from "./config/schema";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import * as path from "path";
import { Client } from "pg";
import { parseEther } from "viem";

dotenv.config({ path: path.resolve(__dirname, "../../.env.development") });

// TODO: protect, only for dev.
// TODO: fix: When you seed again, the ids start from previous deleted databse
async function seed() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  await client.connect();
  const db = drizzle(client, { schema });

  await db.delete(privateNotes).execute(); // Delete private notes first
  await db.delete(stages).execute(); // Ensure stages are deleted before grants
  await db.delete(grants).execute(); // Delete grants
  await db.delete(users).execute();

  await db.insert(users).values([
    {
      address: "0x55b9CB0bCf56057010b9c471e7D42d60e1111EEa",
      role: "admin",
    },
    {
      address: "0x60583563D5879C2E59973E5718c7DE2147971807",
      role: "admin",
    },
    {
      address: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
      role: "admin",
    },
    {
      address: "0xb8224dfCf3C174331a8e6a841AEEa7dF321f6D8E",
      role: "admin",
    },
  ]);

  const insertedGrants = await db
    .insert(grants)
    .values([
      {
        title: "Grant 1",
        description: "Description for grant 1",
        builderAddress: "0x55b9CB0bCf56057010b9c471e7D42d60e1111EEa",
        milestones: "Milestones 1",
        showcaseVideoUrl: "Video url 1",
        requestedFunds: parseEther("0.25"),
        github: "github-account-1",
        twitter: "twitter-account-1",
        telegram: "telegram-account-1",
        email: "email1@email.com",
      },
      {
        title: "Grant 2",
        description: "Description for grant 2",
        builderAddress: "0x60583563D5879C2E59973E5718c7DE2147971807",
        milestones: "Milestones 2",
        showcaseVideoUrl: "Video url 2",
        requestedFunds: parseEther("0.5"),
        github: "github-account-2",
        twitter: "twitter-account-2",
        telegram: null,
        email: "email2@email.com",
      },
      {
        title: "Grant 3",
        description: "Description for grant 3",
        builderAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
        milestones: "Milestones 3",
        showcaseVideoUrl: null,
        requestedFunds: parseEther("1"),
        github: "github-account-3",
        twitter: null,
        telegram: "telegram-account-3",
        email: "email3@email.com",
      },
    ])
    .returning({ id: grants.id })
    .execute();

  await db
    .insert(stages)
    .values([
      {
        milestone: "Milestone of stage 1 for Grant 1",
        stageNumber: 1,
        grantId: insertedGrants[0].id,
        status: "completed",
      },
      {
        milestone: "Milesotne of stage 2 for Grant 1",
        stageNumber: 2,
        grantId: insertedGrants[0].id,
      },
      {
        milestone: "Milestone of stage 1 for Grant 2",
        stageNumber: 1,
        grantId: insertedGrants[1].id,
      },
      {
        milestone: "Milestone of stage 1 for Grant 3",
        stageNumber: 1,
        grantId: insertedGrants[2].id,
      },
    ])
    .execute();

  console.log("Database seeded successfully");
}

seed()
  .catch(error => {
    console.error("Error seeding database:", error);
  })
  .finally(() => {
    process.exit();
  });
