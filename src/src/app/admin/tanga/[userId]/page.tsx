import { notFound, redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { AdminTangaUserPage } from "@/features/admin/tanga/components/admin-tanga-user-page";
import { getAdminTangaUser } from "@/features/admin/tanga/server/get-admin-tanga";

export const dynamic = "force-dynamic";

type StatusMessage = "credited" | "debited" | "insufficient" | "invalid" | "failed";
type NotificationStatus = "sent" | "unavailable" | "failed";

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

function parseNotification(
    value: string | string[] | undefined,
): NotificationStatus | undefined {
    const normalized = Array.isArray(value) ? value[0] : value;

    return normalized === "sent" ||
        normalized === "unavailable" ||
        normalized === "failed"
        ? normalized
        : undefined;
}

export default async function AdminTangaUserRoute({
    params,
    searchParams,
}: {
    params: Promise<{ userId: string }>;
    searchParams: Promise<{
        status?: string | string[];
        notification?: string | string[];
    }>;
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
                notificationStatus={parseNotification(query.notification)}
            />
        </AdminShell>
    );
}
