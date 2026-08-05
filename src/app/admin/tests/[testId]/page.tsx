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
    AdminTestDetailsPage,
} from "@/features/admin/tests/components/admin-test-details-page";
import {
    getAdminTestDetails,
} from "@/features/admin/tests/model/admin-test-details";

interface AdminTestDetailsRouteProps {
    readonly params:
        Promise<{
            readonly testId: string;
        }>;
}

export default async function AdminTestDetailsRoute({
    params,
}: AdminTestDetailsRouteProps) {
    const authenticated =
        await hasValidAdminSession();

    if (!authenticated) {
        redirect("/admin/login");
    }

    const {
        testId,
    } = await params;

    const details =
        getAdminTestDetails(
            decodeURIComponent(testId),
        );

    if (!details) {
        notFound();
    }

    return (
        <AdminShell activeItem="tests">
            <AdminTestDetailsPage
                details={details}
            />
        </AdminShell>
    );
}
