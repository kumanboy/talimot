import "server-only";

import {
    and,
    count,
    desc,
    eq,
    ilike,
    ne,
    or,
} from "drizzle-orm";

import {
    db,
} from "@/lib/database/db";
import {
    adminTestDrafts,
} from "@/lib/database/schema";

import {
    AdminTestDraftConflictError,
    AdminTestDraftNotFoundError,
    AdminTestDraftRepositoryError,
    AdminTestDraftRouteConflictError,
} from "./admin-test-draft-repository-errors";
import {
    mapDraftToStorageRecord,
    mapStorageRecordToDraft,
} from "./admin-test-draft-mapper";

import type {
    AdminTestDraftStorageRecord,
} from "./admin-test-draft-storage-record";
import type {
    AdminTestDraftListFilters,
    AdminTestDraftRepository,
    AdminTestDraftRoute,
    CreateAdminTestDraftInput,
    UpdateAdminTestDraftInput,
} from "./admin-test-draft-repository-types";

function normalizeLimit(
    value:
        number | undefined,
): number {
    if (
        value === undefined
    ) {
        return 25;
    }

    return Math.min(
        100,
        Math.max(
            1,
            Math.trunc(
                value,
            ),
        ),
    );
}

function normalizeOffset(
    value:
        number | undefined,
): number {
    if (
        value === undefined
    ) {
        return 0;
    }

    return Math.max(
        0,
        Math.trunc(
            value,
        ),
    );
}

function isUniqueViolation(
    error:
        unknown,
): boolean {
    return (
        typeof error ===
            "object" &&
        error !== null &&
        "code" in error &&
        error.code ===
            "23505"
    );
}

function toStorageRecord(
    row:
        typeof adminTestDrafts
            .$inferSelect,
): AdminTestDraftStorageRecord {
    return {
        id:
            row.id,
        version:
            row.version,
        status:
            row.status,
        source:
            row.source,
        title:
            row.title,
        description:
            row.description,
        category:
            row.category,
        difficulty:
            row.difficulty,
        estimatedMinutes:
            row.estimatedMinutes,
        groupName:
            row.groupName,
        topicSlug:
            row.topicSlug,
        slug:
            row.slug,
        format:
            row.format,
        access:
            row.access,
        questionCount:
            row.questionCount,
        maximumScore:
            row.maximumScore,
        payload:
            row.payload,
        createdAt:
            row.createdAt,
        updatedAt:
            row.updatedAt,
        createdBy:
            row.createdBy,
        updatedBy:
            row.updatedBy,
    };
}

export class DrizzleAdminTestDraftRepository
    implements AdminTestDraftRepository {
    async create({
        draft,
    }: CreateAdminTestDraftInput) {
        const record =
            mapDraftToStorageRecord(
                draft,
            );

        try {
            const [created] =
                await db
                    .insert(
                        adminTestDrafts,
                    )
                    .values(
                        record,
                    )
                    .returning();

            if (!created) {
                throw new AdminTestDraftRepositoryError(
                    "The draft was not returned after insertion.",
                );
            }

            return mapStorageRecordToDraft(
                toStorageRecord(
                    created,
                ),
            );
        } catch (error) {
            if (
                isUniqueViolation(
                    error,
                )
            ) {
                throw new AdminTestDraftRouteConflictError(
                    record.groupName,
                    record.topicSlug,
                    record.slug,
                    {
                        cause:
                            error,
                    },
                );
            }

            if (
                error instanceof
                AdminTestDraftRepositoryError
            ) {
                throw error;
            }

            throw new AdminTestDraftRepositoryError(
                "Failed to create the admin test draft.",
                {
                    cause:
                        error,
                },
            );
        }
    }

    async getById(
        id: string,
    ) {
        const [row] =
            await db
                .select()
                .from(
                    adminTestDrafts,
                )
                .where(
                    eq(
                        adminTestDrafts.id,
                        id,
                    ),
                )
                .limit(1);

        return row
            ? mapStorageRecordToDraft(
                toStorageRecord(
                    row,
                ),
            )
            : null;
    }

    async getByRoute(
        route:
            AdminTestDraftRoute,
    ) {
        const [row] =
            await db
                .select()
                .from(
                    adminTestDrafts,
                )
                .where(
                    and(
                        eq(
                            adminTestDrafts.groupName,
                            route.group,
                        ),
                        eq(
                            adminTestDrafts.topicSlug,
                            route.topicSlug,
                        ),
                        eq(
                            adminTestDrafts.slug,
                            route.slug,
                        ),
                    ),
                )
                .limit(1);

        return row
            ? mapStorageRecordToDraft(
                toStorageRecord(
                    row,
                ),
            )
            : null;
    }

    async list(
        filters:
            AdminTestDraftListFilters = {},
    ) {
        const search =
            filters.search?.trim();

        const whereClause =
            and(
                filters.status
                    ? eq(
                        adminTestDrafts.status,
                        filters.status,
                    )
                    : undefined,

                filters.group
                    ? eq(
                        adminTestDrafts.groupName,
                        filters.group,
                    )
                    : undefined,

                filters.source
                    ? eq(
                        adminTestDrafts.source,
                        filters.source,
                    )
                    : undefined,

                filters.topicSlug
                    ? eq(
                        adminTestDrafts.topicSlug,
                        filters.topicSlug,
                    )
                    : undefined,

                filters.format
                    ? eq(
                        adminTestDrafts.format,
                        filters.format,
                    )
                    : undefined,

                search
                    ? or(
                        ilike(
                            adminTestDrafts.title,
                            `%${search}%`,
                        ),
                        ilike(
                            adminTestDrafts.topicSlug,
                            `%${search}%`,
                        ),
                        ilike(
                            adminTestDrafts.slug,
                            `%${search}%`,
                        ),
                    )
                    : undefined,
            );

        const limit =
            normalizeLimit(
                filters.limit,
            );

        const offset =
            normalizeOffset(
                filters.offset,
            );

        /*
         * IMPORTANT PERFORMANCE NOTE
         *
         * The old list query used `select()` and therefore downloaded the
         * complete JSONB `payload` for every test draft. Diagnostic tests can
         * contain dozens of questions, rich text and media metadata, so the
         * admin catalogue was transferring far more data than it displayed.
         *
         * The catalogue needs metadata only. PostgreSQL extracts the few
         * metadata values directly from JSONB and leaves the questions payload
         * in the database. This keeps /admin/tests small and fast.
         */
        const queryStartedAt = Date.now();
        console.info("[admin/tests] summary query started");

        const rows = await db
            .select({
                id: adminTestDrafts.id,
                status: adminTestDrafts.status,
                source: adminTestDrafts.source,
                title: adminTestDrafts.title,
                groupName: adminTestDrafts.groupName,
                topicSlug: adminTestDrafts.topicSlug,
                slug: adminTestDrafts.slug,
                format: adminTestDrafts.format,
                access: adminTestDrafts.access,
                questionCount: adminTestDrafts.questionCount,
                maximumScore: adminTestDrafts.maximumScore,
                updatedAt: adminTestDrafts.updatedAt,
                description: adminTestDrafts.description,
                category: adminTestDrafts.category,
                difficulty: adminTestDrafts.difficulty,
                estimatedMinutes: adminTestDrafts.estimatedMinutes,
            })
            .from(adminTestDrafts)
            .where(whereClause)
            .orderBy(
                desc(adminTestDrafts.updatedAt),
            )
            .limit(limit)
            .offset(offset);

        console.info(
            "[admin/tests] summary query completed",
            {
                durationMs: Date.now() - queryStartedAt,
                rowCount: rows.length,
            },
        );

        const items = rows.map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            status: row.status,
            source: row.source,
            group: row.groupName,
            category: row.category,
            topicSlug: row.topicSlug,
            slug: row.slug,
            format: row.format,
            difficulty: row.difficulty,
            access: row.access,
            estimatedMinutes: row.estimatedMinutes,
            questionCount: row.questionCount,
            maximumScore: Number(row.maximumScore),
            updatedAt: row.updatedAt,
        }));

        /*
         * Most admin catalogues are below one page. Avoid a second COUNT(*)
         * query in that common case. Only ask PostgreSQL for the total when a
         * full page means there may be more records.
         */
        if (rows.length < limit) {
            return {
                items,
                total: offset + rows.length,
            };
        }

        const [totalRow] = await db
            .select({
                value: count(),
            })
            .from(adminTestDrafts)
            .where(whereClause);

        return {
            items,
            total: totalRow?.value ?? offset + rows.length,
        };
    }

    async update({
        draft,
        expectedUpdatedAt,
    }: UpdateAdminTestDraftInput) {
        const record =
            mapDraftToStorageRecord(
                draft,
            );

        try {
            const [updated] =
                await db
                    .update(
                        adminTestDrafts,
                    )
                    .set({
                        version:
                            record.version,
                        status:
                            record.status,
                        source:
                            record.source,
                        title:
                            record.title,
                        description:
                            record.description,
                        category:
                            record.category,
                        difficulty:
                            record.difficulty,
                        estimatedMinutes:
                            record.estimatedMinutes,
                        groupName:
                            record.groupName,
                        topicSlug:
                            record.topicSlug,
                        slug:
                            record.slug,
                        format:
                            record.format,
                        access:
                            record.access,
                        questionCount:
                            record.questionCount,
                        maximumScore:
                            record.maximumScore,
                        payload:
                            record.payload,
                        updatedAt:
                            record.updatedAt,
                        updatedBy:
                            record.updatedBy,
                    })
                    .where(
                        and(
                            eq(
                                adminTestDrafts.id,
                                record.id,
                            ),
                            eq(
                                adminTestDrafts
                                    .updatedAt,
                                expectedUpdatedAt,
                            ),
                        ),
                    )
                    .returning();

            if (updated) {
                return mapStorageRecordToDraft(
                    toStorageRecord(
                        updated,
                    ),
                );
            }

            const existing =
                await this.getById(
                    record.id,
                );

            if (!existing) {
                throw new AdminTestDraftNotFoundError(
                    record.id,
                );
            }

            throw new AdminTestDraftConflictError(
                record.id,
            );
        } catch (error) {
            if (
                isUniqueViolation(
                    error,
                )
            ) {
                throw new AdminTestDraftRouteConflictError(
                    record.groupName,
                    record.topicSlug,
                    record.slug,
                    {
                        cause:
                            error,
                    },
                );
            }

            if (
                error instanceof
                AdminTestDraftRepositoryError
            ) {
                throw error;
            }

            throw new AdminTestDraftRepositoryError(
                "Failed to update the admin test draft.",
                {
                    cause:
                        error,
                },
            );
        }
    }

    async delete(
        id: string,
    ) {
        const deleted =
            await db
                .delete(
                    adminTestDrafts,
                )
                .where(
                    eq(
                        adminTestDrafts.id,
                        id,
                    ),
                )
                .returning({
                    id:
                        adminTestDrafts.id,
                });

        return deleted.length > 0;
    }

    async existsByRoute(
        route:
            AdminTestDraftRoute,
        excludeDraftId?: string,
    ) {
        const [row] =
            await db
                .select({
                    id:
                        adminTestDrafts.id,
                })
                .from(
                    adminTestDrafts,
                )
                .where(
                    and(
                        eq(
                            adminTestDrafts
                                .groupName,
                            route.group,
                        ),
                        eq(
                            adminTestDrafts
                                .topicSlug,
                            route.topicSlug,
                        ),
                        eq(
                            adminTestDrafts.slug,
                            route.slug,
                        ),
                        excludeDraftId
                            ? ne(
                                adminTestDrafts.id,
                                excludeDraftId,
                            )
                            : undefined,
                    ),
                )
                .limit(1);

        return Boolean(
            row,
        );
    }
}
