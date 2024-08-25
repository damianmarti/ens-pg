import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { privateNotes } from "~~/services/database/config/schema";

export type PrivateNoteInsert = InferInsertModel<typeof privateNotes>;
export type PrivateNote = InferSelectModel<typeof privateNotes>;

export async function createPrivateNote(privateNote: PrivateNoteInsert) {
  return await db.insert(privateNotes).values(privateNote).returning({ id: privateNotes.id });
}
