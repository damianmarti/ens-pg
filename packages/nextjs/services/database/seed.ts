import { grants, stages } from "./config/schema";
import * as schema from "./config/schema";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import * as path from "path";
import { Client } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../../.env.development") });

// TODO: protect, only for dev.
// TODO: fix: When you seed again, the ids start from previous deleted databse
async function seed() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  await client.connect();
  const db = drizzle(client, { schema });

  await db.delete(stages).execute(); // Ensure stages are deleted before grants
  await db.delete(grants).execute(); // Delete grants

  const insertedGrants = await db
    .insert(grants)
    .values([
      {
        title: "Grant 1",
        description: "Description for grant 1",
        builderAddress: "0x55b9CB0bCf56057010b9c471e7D42d60e1111EEa",
      },
      {
        title: "Grant 2",
        description: "Description for grant 2",
        builderAddress: "0x60583563d5879c2e59973e5718c7de2147971807",
      },
      {
        title: "Grant 3",
        description: "Description for grant 3",
        builderAddress: "0xB4F53bd85c00EF22946d24Ae26BC38Ac64F5E7B1",
      },
    ])
    .returning({ id: grants.id })
    .execute();

  await db
    .insert(stages)
    .values([
      {
        title: "Stage 1 for Grant 1",
        stageNumber: 1,
        grantId: insertedGrants[0].id,
        status: "completed",
      },
      {
        title: "Stage 2 for Grant 1",
        stageNumber: 2,
        grantId: insertedGrants[0].id,
      },
      {
        title: "Stage 1 for Grant 2",
        stageNumber: 1,
        grantId: insertedGrants[1].id,
      },
      {
        title: "Stage 1 for Grant 3",
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
