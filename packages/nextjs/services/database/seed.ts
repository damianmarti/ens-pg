import { grants } from "./config/schema";
import * as schema from "./config/schema";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import * as path from "path";
import { Client } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../../.env.development") });

// TODO: protect, only for dev.
async function seed() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  await client.connect();
  const db = drizzle(client, { schema });

  await db.delete(grants).execute();
  await db
    .insert(grants)
    .values([
      { title: "Grant 1", description: "Description for grant 1" },
      { title: "Grant 2", description: "Description for grant 2" },
      { title: "Grant 3", description: "Description for grant 3" },
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
