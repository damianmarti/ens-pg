import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { largeRejectVotes } from "~~/services/database/config/schema";

export type LargeRejectVoteInsert = InferInsertModel<typeof largeRejectVotes>;
export type LargeRejectVote = InferSelectModel<typeof largeRejectVotes>;

export async function createLargeRejectVote(approvalVote: LargeRejectVoteInsert) {
  return await db.insert(largeRejectVotes).values(approvalVote).returning({ id: largeRejectVotes.id });
}
