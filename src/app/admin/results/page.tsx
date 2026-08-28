import {
    redirect,
} from "next/navigation";

import {
    AdminShell,
} from "@/features/admin/components/admin-shell";
import {
    hasValidAdminSession,
} from "@/features/admin/model/admin-session";
import {
    AdminDiagnosticAnalyticsPage,
} from "@/features/admin/results/components/admin-diagnostic-analytics";
import {
    getAdminDiagnosticAnalytics,
} from "@/features/admin/results/server/get-diagnostic-analytics";

interface Props {
    readonly searchParams: Promise<{
        readonly testId?: string | string[];
    }>;
}

export const dynamic = "force-dynamic";

export default async function AdminResultsRoute({
    searchParams,
}: Props) {
    const authenticated = await hasValidAdminSession();
    if (!authenticated) {
        redirect("/admin/login");
    }

    const params = await searchParams;
    const requestedTestId = Array.isArray(params.testId)
        ? params.testId[0]
        : params.testId;
    const analytics = await getAdminDiagnosticAnalytics(requestedTestId ?? null);

    return (
        <AdminShell activeItem="results">
            <AdminDiagnosticAnalyticsPage analytics={analytics} />
        </AdminShell>
    );
}
