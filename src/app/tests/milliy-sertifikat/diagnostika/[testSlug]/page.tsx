import { notFound, redirect } from "next/navigation";

import { getActiveStudentUserId } from "@/features/auth/server/get-active-student-user";
import { DiagnosticTestStart } from "@/features/national-certificate/components/diagnostic-test-start";
import { getStudentNationalTest } from "@/features/national-certificate/server/get-published-national-test";
import { PaidTestAccessRequired } from "@/features/tests/components/paid-test-access-required";
import { getStudentTestAccessByRoute } from "@/features/tests/server/get-test-access";

type DiagnosticTestRouteProps = {
    readonly params: Promise<{ testSlug: string }>;
};

export default async function DiagnosticTestRoute({ params }: DiagnosticTestRouteProps) {
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

    if (!access.canAccess) {
        return (
            <PaidTestAccessRequired
                testId={access.testId}
                title={access.title}
                href={href}
                backHref="/tests/milliy-sertifikat/diagnostika"
                tangaPrice={access.tangaPrice}
            />
        );
    }

    return <DiagnosticTestStart test={test} />;
}
