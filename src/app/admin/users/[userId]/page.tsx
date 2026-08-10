import { notFound, redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { AdminUserDetailsPage } from "@/features/admin/users/components/admin-user-details-page";
import { getAdminUserById } from "@/features/admin/users/server/get-admin-users";

export const dynamic = "force-dynamic";

interface AdminUserRouteProps {
    params: Promise<{
        userId: string;
    }>;
}

export default async function AdminUserRoute({ params }: AdminUserRouteProps) {
    if (!(await hasValidAdminSession())) {
        redirect("/admin/login");
    }

    const { userId } = await params;
    const user = await getAdminUserById(userId);

    if (!user) {
        notFound();
    }

    return (
        <AdminShell activeItem="users">
            <AdminUserDetailsPage user={user} />
        </AdminShell>
    );
}
