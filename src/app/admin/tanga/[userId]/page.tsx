import { notFound, redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { AdminTangaUserPage } from "@/features/admin/tanga/components/admin-tanga-user-page";
import { getAdminTangaUser } from "@/features/admin/tanga/server/get-admin-tanga";

export const dynamic = "force-dynamic";

type StatusMessage = "credited" | "debited" | "insufficient" | "invalid" | "failed";

function parseStatus(value: string | string[] | undefined): StatusMessage | undefined {
    const normalized = Array.isArray(value) ? value[0] : value;

    return normalized === "credited" ||
        normalized === "debited" ||
        normalized === "insufficient" ||
        normalized === "invalid" ||
        normalized === "failed"
        ? normalized
        : undefined;
}

export default async function AdminTangaUserRoute({
    params,
    searchParams,
}: {
    params: Promise<{ userId: string }>;
    searchParams: Promise<{ status?: string | string[] }>;
}) {
    if (!(await hasValidAdminSession())) {
        redirect("/admin/login");
    }

    const { userId } = await params;
    const details = await getAdminTangaUser(userId);

    if (!details) {
        notFound();
    }

    const query = await searchParams;

    return (
        <AdminShell activeItem="tanga">
            <AdminTangaUserPage
                details={details}
                statusMessage={parseStatus(query.status)}
            />
        </AdminShell>
    );
}
