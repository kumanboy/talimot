import { redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { AdminUsersPage } from "@/features/admin/users/components/admin-users-page";
import {
    getAdminUsersOverview,
    type AdminUserRoleFilter,
    type AdminUserStatusFilter,
} from "@/features/admin/users/server/get-admin-users";

export const dynamic = "force-dynamic";

interface AdminUsersRouteProps {
    searchParams: Promise<{
        q?: string | string[];
        status?: string | string[];
        role?: string | string[];
    }>;
}

function first(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseStatus(value: string): AdminUserStatusFilter {
    return value === "active" || value === "blocked" ? value : "all";
}

function parseRole(value: string): AdminUserRoleFilter {
    return value === "student" || value === "admin" ? value : "all";
}

export default async function AdminUsersRoute({
    searchParams,
}: AdminUsersRouteProps) {
    if (!(await hasValidAdminSession())) {
        redirect("/admin/login");
    }

    const params = await searchParams;
    const search = first(params.q).trim().slice(0, 80);
    const status = parseStatus(first(params.status));
    const role = parseRole(first(params.role));
    const overview = await getAdminUsersOverview({ search, status, role });

    return (
        <AdminShell activeItem="users">
            <AdminUsersPage
                overview={overview}
                search={search}
                status={status}
                role={role}
            />
        </AdminShell>
    );
}
