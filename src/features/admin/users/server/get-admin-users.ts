import "server-only";

import {
    and,
    desc,
    eq,
    ilike,
    isNotNull,
    or,
    sql,
    type SQL,
} from "drizzle-orm";

import { db } from "@/lib/database/db";
import { users } from "@/lib/database/schema";

export type AdminUserStatusFilter =
    | "all"
    | "active"
    | "blocked";

export type AdminUserRoleFilter =
    | "all"
    | "student"
    | "admin";

export type AdminUserListItem = {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly fatherName: string;
    readonly phone: string;
    readonly role: string;
    readonly status: string;
    readonly telegramUserId: number | null;
    readonly telegramUsername: string | null;
    readonly phoneVerifiedAt: number | null;
    readonly createdAt: number;
    readonly updatedAt: number;
};

export type AdminUsersOverview = {
    readonly records: readonly AdminUserListItem[];
    readonly totalCount: number;
    readonly activeCount: number;
    readonly blockedCount: number;
    readonly verifiedCount: number;
    readonly filteredCount: number;
    readonly page: number;
    readonly pageSize: number;
    readonly pageCount: number;
};

const ADMIN_USERS_PAGE_SIZE = 100;

function cleanSearch(value: string): string {
    return value
        .trim()
        .toLocaleLowerCase("uz-UZ")
        .slice(0, 80);
}

function safePage(value: number | undefined): number {
    if (!Number.isFinite(value)) {
        return 1;
    }

    return Math.max(1, Math.floor(value ?? 1));
}

function buildDirectoryFilter(options: {
    search: string;
    status: AdminUserStatusFilter;
    role: AdminUserRoleFilter;
}): SQL | undefined {
    const conditions: SQL[] = [];

    if (options.status !== "all") {
        conditions.push(eq(users.status, options.status));
    }

    if (options.role !== "all") {
        conditions.push(eq(users.role, options.role));
    }

    if (options.search) {
        const pattern = `%${options.search}%`;
        const searchCondition = or(
            ilike(users.id, pattern),
            ilike(users.firstName, pattern),
            ilike(users.lastName, pattern),
            ilike(users.fatherName, pattern),
            ilike(users.phone, pattern),
            ilike(users.telegramUsername, pattern),
            sql`${users.telegramUserId}::text ILIKE ${pattern}`,
            sql`${users.userNumber}::text ILIKE ${pattern}`,
        );

        if (searchCondition) {
            conditions.push(searchCondition);
        }
    }

    return conditions.length > 0
        ? and(...conditions)
        : undefined;
}

/**
 * Admin users directory.
 *
 * Important: totals are calculated by PostgreSQL and are not derived from
 * the current table page. The old implementation used `.limit(1000)` and
 * therefore silently capped every counter at 1000. Records are now paged so
 * this screen remains fast even when the platform grows to many thousands of
 * users.
 */
export async function getAdminUsersOverview(options?: {
    search?: string;
    status?: AdminUserStatusFilter;
    role?: AdminUserRoleFilter;
    page?: number;
}): Promise<AdminUsersOverview> {
    const search = cleanSearch(options?.search ?? "");
    const status = options?.status ?? "all";
    const role = options?.role ?? "all";
    const requestedPage = safePage(options?.page);
    const where = buildDirectoryFilter({ search, status, role });

    const queryStartedAt = Date.now();
    console.info("[admin/users] directory query started", {
        requestedPage,
        hasSearch: Boolean(search),
        status,
        role,
    });

    const [globalStats] = await db
        .select({
            totalCount: sql<number>`count(*)::int`,
            activeCount: sql<number>`count(*) filter (where ${users.status} = 'active')::int`,
            blockedCount: sql<number>`count(*) filter (where ${users.status} = 'blocked')::int`,
            verifiedCount: sql<number>`count(*) filter (where ${isNotNull(users.phoneVerifiedAt)})::int`,
        })
        .from(users);

    const filteredCountQuery = db
        .select({
            count: sql<number>`count(*)::int`,
        })
        .from(users);

    const [filteredStats] = where
        ? await filteredCountQuery.where(where)
        : await filteredCountQuery;

    const filteredCount = Number(filteredStats?.count ?? 0);
    const pageCount = Math.max(
        1,
        Math.ceil(filteredCount / ADMIN_USERS_PAGE_SIZE),
    );
    const page = Math.min(requestedPage, pageCount);
    const offset = (page - 1) * ADMIN_USERS_PAGE_SIZE;

    const recordsQuery = db
        .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            fatherName: users.fatherName,
            phone: users.phone,
            role: users.role,
            status: users.status,
            telegramUserId: users.telegramUserId,
            telegramUsername: users.telegramUsername,
            phoneVerifiedAt: users.phoneVerifiedAt,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users);

    const records = where
        ? await recordsQuery
              .where(where)
              .orderBy(desc(users.createdAt))
              .limit(ADMIN_USERS_PAGE_SIZE)
              .offset(offset)
        : await recordsQuery
              .orderBy(desc(users.createdAt))
              .limit(ADMIN_USERS_PAGE_SIZE)
              .offset(offset);

    console.info("[admin/users] directory query completed", {
        durationMs: Date.now() - queryStartedAt,
        totalCount: Number(globalStats?.totalCount ?? 0),
        filteredCount,
        page,
        pageSize: ADMIN_USERS_PAGE_SIZE,
        rowCount: records.length,
    });

    return {
        records,
        totalCount: Number(globalStats?.totalCount ?? 0),
        activeCount: Number(globalStats?.activeCount ?? 0),
        blockedCount: Number(globalStats?.blockedCount ?? 0),
        verifiedCount: Number(globalStats?.verifiedCount ?? 0),
        filteredCount,
        page,
        pageSize: ADMIN_USERS_PAGE_SIZE,
        pageCount,
    };
}

export async function getAdminUserById(userId: string) {
    const [user] = await db
        .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            fatherName: users.fatherName,
            phone: users.phone,
            role: users.role,
            status: users.status,
            telegramUserId: users.telegramUserId,
            telegramChatId: users.telegramChatId,
            telegramUsername: users.telegramUsername,
            phoneVerifiedAt: users.phoneVerifiedAt,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return user ?? null;
}
