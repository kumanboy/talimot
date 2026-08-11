import { redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { AdminPaymentsPage } from "@/features/admin/payments/components/admin-payments-page";
import { getAdminPaymentsOverview } from "@/features/admin/payments/server/get-admin-payments";

export const dynamic = "force-dynamic";

interface Props {
    searchParams: Promise<{
        q?: string | string[];
        status?: string | string[];
        kind?: string | string[];
    }>;
}

function first(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminPaymentsRoute({ searchParams }: Props) {
    if (!(await hasValidAdminSession())) {
        redirect("/admin/login");
    }

    const params = await searchParams;
    const search = first(params.q).trim().slice(0, 80);
    const status = first(params.status).trim();
    const kind = first(params.kind).trim();
    const overview = await getAdminPaymentsOverview({ search, status, kind });

    return (
        <AdminShell activeItem="payments">
            <AdminPaymentsPage
                overview={overview}
                search={search}
                status={status}
                kind={kind}
            />
        </AdminShell>
    );
}
