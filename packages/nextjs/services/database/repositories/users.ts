import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { users } from "~~/services/database/config/schema";

export type UserInsert = InferInsertModel<typeof users>;
export type UserUpdate = Partial<UserInsert>;
export type User = InferSelectModel<typeof users>;

export async function createUser(user: UserInsert) {
  return await db.insert(users).values(user).returning({ id: users.id, role: users.role, address: users.address });
}

export async function updateUser(userId: Required<UserUpdate>["id"], user: UserUpdate) {
  return await db.update(users).set(user).where(eq(users.id, userId));
}

export async function findUserByAddress(address: string) {
  return await db.query.users.findFirst({ where: eq(users.address, address) });
}
