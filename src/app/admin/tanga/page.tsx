import { redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { AdminTangaPage } from "@/features/admin/tanga/components/admin-tanga-page";
import { getAdminTangaOverview } from "@/features/admin/tanga/server/get-admin-tanga";

export const dynamic = "force-dynamic";

interface AdminTangaRouteProps {
    searchParams: Promise<{
        q?: string | string[];
    }>;
}

function first(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminTangaRoute({
    searchParams,
}: AdminTangaRouteProps) {
    if (!(await hasValidAdminSession())) {
        redirect("/admin/login");
    }

    const params = await searchParams;
    const search = first(params.q).trim().slice(0, 80);
    const overview = await getAdminTangaOverview({ search });

    return (
        <AdminShell activeItem="tanga">
            <AdminTangaPage overview={overview} search={search} />
        </AdminShell>
    );
}
