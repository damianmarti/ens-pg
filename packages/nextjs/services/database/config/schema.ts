import { sql } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// TODO: Define the right schema.
export const grants = pgTable("grants", {
  id: serial("id").primaryKey(),
  title: varchar("name", { length: 256 }),
  description: text("description"),
  submissionTimestamp: timestamp("submission_timestamp").default(sql`now()`),
});

export const stages = pgTable("stages", {
  id: serial("id").primaryKey(),
  description: text("description"),
  stageNumber: integer("stage_number"),
  submissionTimestamp: timestamp("submission_timestamp").default(sql`now()`),
  grant: integer("grant_id").references(() => grants.id),
});
