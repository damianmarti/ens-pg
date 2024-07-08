import { InferInsertModel, InferSelectModel, desc, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { grants, stages } from "~~/services/database/config/schema";

export type GrantInsert = InferInsertModel<typeof grants>;
export type Grant = InferSelectModel<typeof grants>;

export async function getAllGrants() {
  return await db.query.grants.findMany({
    with: {
      stages: {
        // this makes sure latest stage is first
        orderBy: [desc(stages.stageNumber)],
      },
    },
  });
}

export async function getBuilderGrants(builderAddress: string) {
  return await db.query.grants.findMany({
    where: eq(grants.builderAddress, builderAddress),
    with: {
      stages: {
        orderBy: [desc(stages.stageNumber)],
      },
    },
  });
}

export async function createGrant(grant: GrantInsert) {
  return await db.insert(grants).values(grant).returning({ id: grants.id });
}

export async function getGrantById(grantId: number) {
  return await db.query.grants.findFirst({
    where: eq(grants.id, grantId),
    with: {
      stages: {
        orderBy: [desc(stages.stageNumber)],
      },
    },
  });
}
