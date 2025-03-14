import { InferInsertModel, InferSelectModel, desc, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { largeGrants, largeMilestones, largeStages } from "~~/services/database/config/schema";

export type LargeGrantInsert = InferInsertModel<typeof largeGrants>;
export type LargeGrantInsertWithMilestones = LargeGrantInsert & {
  milestones: Omit<InferInsertModel<typeof largeMilestones>, "stageId" | "milestoneNumber">[];
};
export type LargeGrant = InferSelectModel<typeof largeGrants>;
export type PublicLargeGrant = Awaited<ReturnType<typeof getPublicLargeGrants>>[number];

// Note: not used yet
export async function getAllLargeGrants() {
  return await db.query.largeGrants.findMany({
    orderBy: [desc(largeGrants.submitedAt)],
    with: {
      stages: {
        // this makes sure latest stage is first
        orderBy: [desc(largeStages.stageNumber)],
      },
    },
  });
}

// Excludes sensitive information for public pages
export async function getPublicLargeGrants() {
  return await db.query.largeGrants.findMany({
    orderBy: [desc(largeGrants.submitedAt)],
    columns: {
      id: true,
      title: true,
      description: true,
      builderAddress: true,
      submitedAt: true,
    },
    with: {
      stages: {
        orderBy: [desc(largeStages.stageNumber)],
        columns: {
          id: true,
          stageNumber: true,
          submitedAt: true,
          status: true,
        },
        with: {
          milestones: {
            orderBy: [desc(largeMilestones.milestoneNumber)],
            columns: {
              id: true,
              milestoneNumber: true,
              description: true,
              amount: true,
              status: true,
              completedAt: true,
              completionProof: true,
            },
          },
        },
      },
    },
  });
}

// Note: not used yet
// Note: use only for admin pages
export async function getAllLargeGrantsWithStagesAndPrivateNotes() {
  return await db.query.largeGrants.findMany({
    orderBy: [desc(largeGrants.submitedAt)],
    with: {
      stages: {
        // this makes sure latest stage is first
        orderBy: [desc(largeStages.stageNumber)],
        with: {
          privateNotes: true,
          approvalVotes: true,
        },
      },
    },
  });
}

// Note: not used yet
export async function getBuilderLargeGrants(builderAddress: string) {
  return await db.query.largeGrants.findMany({
    where: eq(largeGrants.builderAddress, builderAddress),
    with: {
      stages: {
        orderBy: [desc(largeStages.stageNumber)],
      },
    },
  });
}

export async function createLargeGrant(
  grant: LargeGrantInsertWithMilestones,
): Promise<{ grantId: number; stageId: number; createdMilestones: number[] }> {
  return await db.transaction(async tx => {
    const [createdGrant] = await tx.insert(largeGrants).values(grant).returning({ id: largeGrants.id });
    const [createdStage] = await tx
      .insert(largeStages)
      .values({ grantId: createdGrant.id })
      .returning({ id: largeStages.id });

    const createdMilestones = [];

    for (let i = 0; i < grant.milestones.length; i++) {
      const milestone = grant.milestones[i];
      const [createdMilestone] = await tx
        .insert(largeMilestones)
        .values({
          ...milestone,
          stageId: createdStage.id,
          milestoneNumber: i + 1,
        })
        .returning({ id: largeMilestones.id });
      createdMilestones.push(createdMilestone.id);
    }

    return { grantId: createdGrant.id, stageId: createdStage.id, createdMilestones };
  });
}

// Note: not used yet
export async function getLargeGrantById(grantId: number) {
  return await db.query.largeGrants.findFirst({
    where: eq(largeGrants.id, grantId),
    with: {
      stages: {
        orderBy: [desc(largeStages.stageNumber)],
      },
    },
  });
}
