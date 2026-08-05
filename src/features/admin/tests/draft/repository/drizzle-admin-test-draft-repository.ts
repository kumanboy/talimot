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
    mapStorageRecordToSummary,
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

        const [
            rows,
            totalRows,
        ] =
            await Promise.all([
                db
                    .select()
                    .from(
                        adminTestDrafts,
                    )
                    .where(
                        whereClause,
                    )
                    .orderBy(
                        desc(
                            adminTestDrafts
                                .updatedAt,
                        ),
                    )
                    .limit(
                        limit,
                    )
                    .offset(
                        offset,
                    ),

                db
                    .select({
                        value:
                            count(),
                    })
                    .from(
                        adminTestDrafts,
                    )
                    .where(
                        whereClause,
                    ),
            ]);

        return {
            items:
                rows.map(
                    (row) =>
                        mapStorageRecordToSummary(
                            toStorageRecord(
                                row,
                            ),
                        ),
                ),
            total:
                totalRows[0]?.value ??
                0,
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
