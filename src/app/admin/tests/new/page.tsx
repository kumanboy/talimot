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
    AdminCreateTestDraftPage,
} from "@/features/admin/tests/draft/components/admin-create-test-draft-page";

export default async function AdminCreateTestDraftRoute() {
    const authenticated =
        await hasValidAdminSession();

    if (!authenticated) {
        redirect(
            "/admin/login",
        );
    }

    return (
        <AdminShell activeItem="tests">
            <AdminCreateTestDraftPage />
        </AdminShell>
    );
}
