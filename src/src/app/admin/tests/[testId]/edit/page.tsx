import {
    notFound,
    redirect,
} from "next/navigation";

import {
    AdminShell,
} from "@/features/admin/components/admin-shell";
import {
    hasValidAdminSession,
} from "@/features/admin/model/admin-session";
import {
    AdminMultipleChoiceDraftEditor,
} from "@/features/admin/tests/draft/components/admin-multiple-choice-draft-editor";
import {
    adminTestDraftService,
} from "@/features/admin/tests/draft/repository/admin-test-draft-service-instance";

interface AdminDraftEditRouteProps {
    readonly params:
        Promise<{
            readonly testId:
                string;
        }>;
}

export default async function AdminDraftEditRoute({
    params,
}: AdminDraftEditRouteProps) {
    const authenticated =
        await hasValidAdminSession();

    if (!authenticated) {
        redirect(
            "/admin/login",
        );
    }

    const {
        testId,
    } = await params;

    const draft =
        await adminTestDraftService.getById(
            decodeURIComponent(
                testId,
            ),
        );

    if (!draft) {
        notFound();
    }

    return (
        <AdminShell activeItem="tests">
            <AdminMultipleChoiceDraftEditor
                initialDraft={draft}
            />
        </AdminShell>
    );
}
