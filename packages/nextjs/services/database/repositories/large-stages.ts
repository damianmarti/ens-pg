import { LargeMilestone } from "./large-milestones";
import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { largeStages, stagesStatusEnum } from "~~/services/database/config/schema";

export type LargeStageInsert = InferInsertModel<typeof largeStages>;
export type LargeStageUpdate = Partial<LargeStageInsert>;
export type LargeStage = InferSelectModel<typeof largeStages>;
export type LargeStageWithMilestones = LargeStage & {
  milestones: LargeMilestone[];
};

export type Status = (typeof stagesStatusEnum.enumValues)[number];

// Note: not used yet
export async function createStage(stage: LargeStageInsert) {
  return await db.insert(largeStages).values(stage).returning({ id: largeStages.id });
}

// Note: not used yet
export async function updateStage(stageId: Required<LargeStageUpdate>["id"], stage: LargeStageUpdate) {
  return await db.update(largeStages).set(stage).where(eq(largeStages.id, stageId));
}

// Note: not used yet
export async function getStageByIdWithGrantAndVotes(stageId: number) {
  return await db.query.largeStages.findFirst({
    where: eq(largeStages.id, stageId),
    with: {
      grant: true,
      approvalVotes: true,
    },
  });
}

// Note: not used yet
export async function updateStageStatusToCompleted(stageId: number) {
  return await db.update(largeStages).set({ status: "completed" }).where(eq(largeStages.id, stageId));
}
