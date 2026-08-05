CREATE TABLE "admin_test_drafts" (
	"id" text PRIMARY KEY NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" text NOT NULL,
	"source" text NOT NULL,
	"title" text NOT NULL,
	"group_name" text NOT NULL,
	"topic_slug" text NOT NULL,
	"slug" text NOT NULL,
	"format" text NOT NULL,
	"access" text NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"maximum_score" numeric(10, 2) DEFAULT '0' NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	"created_by" text,
	"updated_by" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX "admin_test_drafts_route_unique" ON "admin_test_drafts" USING btree ("group_name","topic_slug","slug");--> statement-breakpoint
CREATE INDEX "admin_test_drafts_status_idx" ON "admin_test_drafts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "admin_test_drafts_updated_at_idx" ON "admin_test_drafts" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "admin_test_drafts_title_idx" ON "admin_test_drafts" USING btree ("title");