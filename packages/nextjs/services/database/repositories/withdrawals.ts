import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { withdrawals } from "~~/services/database/config/schema";

export type WithdrawalInsert = InferInsertModel<typeof withdrawals>;
export type WithdrawalUpdate = Partial<WithdrawalInsert>;
export type Withdrawal = InferSelectModel<typeof withdrawals>;

export async function createWithdrawal(withdrawal: WithdrawalInsert) {
  return await db.insert(withdrawals).values(withdrawal).returning({ id: withdrawals.id });
}

export async function updateWithdrawal(withdrawalId: Required<WithdrawalUpdate>["id"], withdrawal: WithdrawalUpdate) {
  return await db.update(withdrawals).set(withdrawal).where(eq(withdrawals.id, withdrawalId));
}
