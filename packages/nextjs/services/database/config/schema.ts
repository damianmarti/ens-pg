import { relations, sql } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// TODO: Define the right schema.

export const grants = pgTable("grants", {
  // TODO: Should ID be a UUID? Or is it fine as a serial?
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  submissionTimestamp: timestamp("submission_timestamp").default(sql`now()`),
  // TODO: Should this be unique?
  builderAddress: varchar("builder_address", { length: 42 }).notNull(),
});

export const grantsRelations = relations(grants, ({ many }) => ({
  stages: many(stages),
}));

export const stages = pgTable("stages", {
  // TODO: Should ID be a UUID?
  id: serial("id").primaryKey(),
  description: text("description"),
  stageNumber: integer("stage_number"),
  submissionTimestamp: timestamp("submission_timestamp").default(sql`now()`),
  grantId: integer("grant_id")
    .references(() => grants.id)
    .notNull(),
});

export const stagesRelations = relations(stages, ({ one }) => ({
  grant: one(grants, {
    fields: [stages.grantId],
    references: [grants.id],
  }),
}));
