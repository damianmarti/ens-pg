import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { largeMilestones, milestonesStatusEnum } from "~~/services/database/config/schema";

export type LargeMilestoneInsert = InferInsertModel<typeof largeMilestones>;
export type LargeMilestoneUpdate = Partial<LargeMilestoneInsert>;
export type LargeMilestone = InferSelectModel<typeof largeMilestones>;
export type LargeMilestoneStatus = (typeof milestonesStatusEnum.enumValues)[number];

// Note: not used yet
export async function createMilestone(milestone: LargeMilestoneInsert) {
  return await db.insert(largeMilestones).values(milestone).returning({ id: largeMilestones.id });
}

// Note: not used yet
export async function updateMilestone(
  milestoneId: Required<LargeMilestoneUpdate>["id"],
  milestone: LargeMilestoneUpdate,
) {
  return await db.update(largeMilestones).set(milestone).where(eq(largeMilestones.id, milestoneId));
}

// Note: not used yet
export async function updateMilestoneStatusToCompleted(milestoneId: number) {
  return await db.update(largeMilestones).set({ status: "completed" }).where(eq(largeMilestones.id, milestoneId));
}
