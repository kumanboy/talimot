import { notFound, redirect } from "next/navigation";

import { getActiveStudentUserId } from "@/features/auth/server/get-active-student-user";
import { DiagnosticTestResult } from "@/features/national-certificate/components/diagnostic-test-result";
import { getStudentNationalTest } from "@/features/national-certificate/server/get-published-national-test";
import { getStudentTestAccessByRoute } from "@/features/tests/server/get-test-access";

type DiagnosticResultRouteProps = {
    readonly params: Promise<{ testSlug: string }>;
};

export default async function DiagnosticResultRoute({ params }: DiagnosticResultRouteProps) {
    const { testSlug } = await params;
    const test = await getStudentNationalTest("diagnostika", testSlug);

    if (!test || test.kind !== "diagnostic" || test.topic !== "diagnostika") {
        notFound();
    }

    const userId = await getActiveStudentUserId();
    const href = `/tests/milliy-sertifikat/diagnostika/${testSlug}`;
    if (!userId) {
        redirect(`/auth/login?next=${encodeURIComponent(href)}`);
    }
    const access = await getStudentTestAccessByRoute(
        {
            group: "national-certificate",
            topicSlug: "diagnostika",
            testSlug,
            href,
        },
        userId,
    );

    if (!access) notFound();
    if (!access.canAccess) redirect(href);

    return <DiagnosticTestResult test={test} />;
}
