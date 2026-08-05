import {
    bigint,
    index,
    integer,
    jsonb,
    numeric,
    pgTable,
    text,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import type {
    AdminTestDraft,
} from "@/features/admin/tests/draft/model";

export const adminTestDrafts =
    pgTable(
        "admin_test_drafts",
        {
            id:
                text("id")
                    .primaryKey(),

            version:
                integer("version")
                    .notNull()
                    .default(1),

            status:
                text("status")
                    .$type<
                        AdminTestDraft["status"]
                    >()
                    .notNull(),

            source:
                text("source")
                    .$type<
                        AdminTestDraft["source"]
                    >()
                    .notNull(),

            title:
                text("title")
                    .notNull(),

            groupName:
                text("group_name")
                    .$type<
                        AdminTestDraft[
                            "metadata"
                        ]["group"]
                    >()
                    .notNull(),

            topicSlug:
                text("topic_slug")
                    .notNull(),

            slug:
                text("slug")
                    .notNull(),

            format:
                text("format")
                    .$type<
                        AdminTestDraft[
                            "metadata"
                        ]["format"]
                    >()
                    .notNull(),

            access:
                text("access")
                    .$type<
                        AdminTestDraft[
                            "metadata"
                        ]["access"]
                    >()
                    .notNull(),

            questionCount:
                integer(
                    "question_count",
                )
                    .notNull()
                    .default(0),

            maximumScore:
                numeric(
                    "maximum_score",
                    {
                        precision: 10,
                        scale: 2,
                    },
                )
                    .notNull()
                    .default("0"),

            payload:
                jsonb("payload")
                    .$type<AdminTestDraft>()
                    .notNull(),

            createdAt:
                bigint(
                    "created_at",
                    {
                        mode: "number",
                    },
                )
                    .notNull(),

            updatedAt:
                bigint(
                    "updated_at",
                    {
                        mode: "number",
                    },
                )
                    .notNull(),

            createdBy:
                text("created_by"),

            updatedBy:
                text("updated_by"),
        },
        (table) => [
            uniqueIndex(
                "admin_test_drafts_route_unique",
            ).on(
                table.groupName,
                table.topicSlug,
                table.slug,
            ),

            index(
                "admin_test_drafts_status_idx",
            ).on(
                table.status,
            ),

            index(
                "admin_test_drafts_updated_at_idx",
            ).on(
                table.updatedAt,
            ),

            index(
                "admin_test_drafts_title_idx",
            ).on(
                table.title,
            ),
        ],
    );

export type AdminTestDraftRow =
    typeof adminTestDrafts.$inferSelect;

export type NewAdminTestDraftRow =
    typeof adminTestDrafts.$inferInsert;
