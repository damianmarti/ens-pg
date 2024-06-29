import { InferInsertModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { grants } from "~~/services/database/config/schema";

export type GrantInsert = InferInsertModel<typeof grants>;

export async function getAllGrants() {
  return await db.select().from(grants);
}

export async function createGrant(grant: GrantInsert) {
  return await db.insert(grants).values(grant);
}
