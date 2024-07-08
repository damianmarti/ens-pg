import { relations, sql } from "drizzle-orm";
import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// TODO: Define the right schema.

export const grants = pgTable("grants", {
  // TODO: Should ID be a UUID? Or is it fine as a serial?
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  submitedAt: timestamp("submited_at").default(sql`now()`),
  builderAddress: varchar("builder_address", { length: 42 }).notNull(),
});

export const grantsRelations = relations(grants, ({ many }) => ({
  stages: many(stages),
}));

export const stagesStatusEnum = pgEnum("stage_status", ["proposed", "approved", "completed", "rejected"]);
export const stages = pgTable("stages", {
  // TODO: Should ID be a UUID?
  id: serial("id").primaryKey(),
  stageNumber: integer("stage_number").notNull().default(1),
  title: varchar("title", { length: 256 }).notNull().default("Stage 1"),
  submitedAt: timestamp("submited_at").default(sql`now()`),
  grantId: integer("grant_id")
    .references(() => grants.id)
    .notNull(),
  status: stagesStatusEnum("status").notNull().default("proposed"),
  approvedTx: varchar("approved_tx", { length: 66 }),
  approvedAt: timestamp("approved_at"),
});

export const stagesRelations = relations(stages, ({ one }) => ({
  grant: one(grants, {
    fields: [stages.grantId],
    references: [grants.id],
  }),
}));
