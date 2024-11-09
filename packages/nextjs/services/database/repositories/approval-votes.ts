import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { approvalVotes } from "~~/services/database/config/schema";

export type ApprovalVoteInsert = InferInsertModel<typeof approvalVotes>;
export type ApprovalVote = InferSelectModel<typeof approvalVotes>;

export async function createApprovalVote(approvalVote: ApprovalVoteInsert) {
  return await db.insert(approvalVotes).values(approvalVote).returning({ id: approvalVotes.id });
}
