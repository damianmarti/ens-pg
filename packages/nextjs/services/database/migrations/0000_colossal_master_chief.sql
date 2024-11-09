DO $$ BEGIN
 CREATE TYPE "public"."stage_status" AS ENUM('proposed', 'approved', 'completed', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('admin', 'grantee');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "approval_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" bigint NOT NULL,
	"voted_at" timestamp DEFAULT now(),
	"stage_id" integer NOT NULL,
	"author_address" varchar(42) NOT NULL,
	CONSTRAINT "approval_votes_stage_id_author_address_unique" UNIQUE("stage_id","author_address")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "grants" (
	"id" serial PRIMARY KEY NOT NULL,
	"grant_number" integer DEFAULT 1 NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"milestones" text NOT NULL,
	"showcaseVideoUrl" text,
	"requestedFunds" bigint NOT NULL,
	"github" text NOT NULL,
	"email" text NOT NULL,
	"twitter" text,
	"telegram" text,
	"submited_at" timestamp DEFAULT now(),
	"builder_address" varchar(42) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "private_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"note" text NOT NULL,
	"written_at" timestamp DEFAULT now(),
	"stage_id" integer NOT NULL,
	"author_address" varchar(42) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"stage_number" integer DEFAULT 1 NOT NULL,
	"milestone" text,
	"submited_at" timestamp DEFAULT now(),
	"grant_id" integer NOT NULL,
	"grantAmount" bigint,
	"status" "stage_status" DEFAULT 'proposed' NOT NULL,
	"statusNote" text,
	"approved_tx" varchar(66),
	"approved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" "user_role" DEFAULT 'grantee' NOT NULL,
	"address" varchar(42) NOT NULL,
	CONSTRAINT "users_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "withdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"milestones" text,
	"withdrew_at" timestamp DEFAULT now(),
	"stage_id" integer NOT NULL,
	"grantAmount" bigint
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "approval_votes" ADD CONSTRAINT "approval_votes_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "approval_votes" ADD CONSTRAINT "approval_votes_author_address_users_address_fk" FOREIGN KEY ("author_address") REFERENCES "public"."users"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "grants" ADD CONSTRAINT "grants_builder_address_users_address_fk" FOREIGN KEY ("builder_address") REFERENCES "public"."users"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "private_notes" ADD CONSTRAINT "private_notes_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "private_notes" ADD CONSTRAINT "private_notes_author_address_users_address_fk" FOREIGN KEY ("author_address") REFERENCES "public"."users"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stages" ADD CONSTRAINT "stages_grant_id_grants_id_fk" FOREIGN KEY ("grant_id") REFERENCES "public"."grants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
