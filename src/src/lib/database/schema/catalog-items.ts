import {
    bigint,
    index,
    integer,
    jsonb,
    pgTable,
    text,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const catalogItems = pgTable(
    "catalog_items",
    {
        id: text("id").primaryKey(),
        kind: text("kind").notNull(),
        slug: text("slug").notNull(),
        title: text("title").notNull(),
        status: text("status").notNull().default("draft"),
        coverImage: text("cover_image"),
        originalPrice: integer("original_price").notNull().default(0),
        salePrice: integer("sale_price").notNull().default(0),
        saleEndsAt: text("sale_ends_at"),
        sortOrder: integer("sort_order").notNull().default(0),
        payload: jsonb("payload")
            .$type<Record<string, unknown>>()
            .notNull()
            .default({}),
        createdAt: bigint("created_at", { mode: "number" }).notNull(),
        updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
    },
    (table) => [
        uniqueIndex("catalog_items_kind_slug_unique").on(
            table.kind,
            table.slug,
        ),
        index("catalog_items_kind_status_idx").on(
            table.kind,
            table.status,
        ),
        index("catalog_items_sort_order_idx").on(
            table.kind,
            table.sortOrder,
            table.updatedAt,
        ),
    ],
);

export type CatalogItemRow = typeof catalogItems.$inferSelect;
export type NewCatalogItemRow = typeof catalogItems.$inferInsert;
