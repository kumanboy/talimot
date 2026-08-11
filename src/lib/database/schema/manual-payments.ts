import {
    bigint,
    index,
    integer,
    jsonb,
    pgTable,
    text,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export type ManualPaymentKind = "tanga" | "book" | "course";
export type ManualPaymentStatus =
    | "pending"
    | "confirmed"
    | "rejected"
    | "cancelled";

export const manualPayments = pgTable(
    "manual_payments",
    {
        id: text("id").primaryKey(),
        userId: text("user_id").references(() => users.id, {
            onDelete: "set null",
        }),
        kind: text("kind").$type<ManualPaymentKind>().notNull(),
        itemKey: text("item_key").notNull(),
        title: text("title").notNull(),
        quantity: integer("quantity").notNull().default(1),
        amountSom: integer("amount_som").notNull(),
        paymentMethod: text("payment_method").notNull().default("HUMO"),
        status: text("status").$type<ManualPaymentStatus>().notNull().default("pending"),
        fullName: text("full_name"),
        phone: text("phone"),
        telegramUsername: text("telegram_username"),
        metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
        receiptReference: text("receipt_reference"),
        adminNote: text("admin_note"),
        processedBy: text("processed_by"),
        createdAt: bigint("created_at", { mode: "number" }).notNull(),
        updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
        processedAt: bigint("processed_at", { mode: "number" }),
    },
    (table) => [
        index("manual_payments_created_idx").on(table.createdAt),
        index("manual_payments_status_created_idx").on(table.status, table.createdAt),
        index("manual_payments_kind_created_idx").on(table.kind, table.createdAt),
        index("manual_payments_user_created_idx").on(table.userId, table.createdAt),
        index("manual_payments_phone_idx").on(table.phone),
    ],
);

export type ManualPaymentRow = typeof manualPayments.$inferSelect;
export type NewManualPaymentRow = typeof manualPayments.$inferInsert;
