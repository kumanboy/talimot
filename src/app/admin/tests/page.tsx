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
    AdminTestsPage,
} from "@/features/admin/tests/components/admin-tests-page";
import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";
import type {
    AdminTestDraftSummary,
} from "@/features/admin/tests/draft/model";

async function listAllDatabaseTests(): Promise<{
    readonly items:
        readonly AdminTestDraftSummary[];
    readonly total: number;
}> {
    const pageSize =
        100;
    const items:
        AdminTestDraftSummary[] =
        [];
    let offset =
        0;
    let total =
        Number.POSITIVE_INFINITY;

    while (
        offset < total
    ) {
        const page =
            await adminTestDraftService.list({
                limit:
                    pageSize,
                offset,
            });

        items.push(
            ...page.items,
        );
        total =
            page.total;

        if (
            page.items.length ===
            0
        ) {
            break;
        }

        offset +=
            page.items.length;
    }

    return {
        items,
        total:
            Number.isFinite(
                total,
            )
                ? total
                : items.length,
    };
}

export default async function AdminTestsRoute() {
    const authenticated =
        await hasValidAdminSession();

    if (!authenticated) {
        redirect("/admin/login");
    }

    /*
     * Admin catalogue is database-authoritative. It no longer imports the
     * old planned/static catalogues, so /admin/tests reflects only real DB
     * records and avoids the previous duplicate static + DB loading path.
     */
    const records =
        await listAllDatabaseTests();

    return (
        <AdminShell activeItem="tests">
            <AdminTestsPage
                records={records.items}
                total={records.total}
            />
        </AdminShell>
    );
}
