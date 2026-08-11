import {
    bigint,
    boolean,
    index,
    pgTable,
    text,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const notifications = pgTable(
    "notifications",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        kind: text("kind").notNull().default("system"),
        title: text("title").notNull(),
        message: text("message").notNull(),
        href: text("href"),
        isRead: boolean("is_read").notNull().default(false),
        createdAt: bigint("created_at", { mode: "number" }).notNull(),
    },
    (table) => [
        index("notifications_user_created_idx").on(
            table.userId,
            table.createdAt,
        ),
        index("notifications_user_read_idx").on(
            table.userId,
            table.isRead,
        ),
    ],
);

export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotificationRow = typeof notifications.$inferInsert;
