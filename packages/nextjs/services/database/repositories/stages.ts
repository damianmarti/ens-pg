import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { stages } from "~~/services/database/config/schema";

export type StageInsert = InferInsertModel<typeof stages>;
export type StageUpdate = Partial<StageInsert>;
export type Stage = InferSelectModel<typeof stages>;

export async function createStage(stage: StageInsert) {
  return await db.insert(stages).values(stage).returning({ id: stages.id });
}

export async function updateStage(stageId: Required<StageUpdate>["id"], stage: StageUpdate) {
  return await db.update(stages).set(stage).where(eq(stages.id, stageId));
}
