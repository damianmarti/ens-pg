import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { withdrawals } from "~~/services/database/config/schema";

export type WithdrawalInsert = InferInsertModel<typeof withdrawals>;
export type Withdrawal = InferSelectModel<typeof withdrawals>;

export async function createWithdrawal(withdrawal: WithdrawalInsert) {
  return await db.insert(withdrawals).values(withdrawal).returning({ id: withdrawals.id });
}
