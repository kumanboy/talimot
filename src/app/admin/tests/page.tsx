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
    adminTestCatalog,
    adminTestCatalogStats,
} from "@/features/admin/tests/model/admin-test-catalog";
import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";

export default async function AdminTestsRoute() {
    const authenticated =
        await hasValidAdminSession();

    if (!authenticated) {
        redirect("/admin/login");
    }

    const drafts =
        await adminTestDraftService.list({
            limit: 100,
            offset: 0,
        });

    return (
        <AdminShell activeItem="tests">
            <AdminTestsPage
                tests={adminTestCatalog}
                stats={adminTestCatalogStats}
                drafts={drafts.items}
                draftTotal={drafts.total}
            />
        </AdminShell>
    );
}
