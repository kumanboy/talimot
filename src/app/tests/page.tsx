import { TestsPage } from "@/features/tests/components/tests-page";
import {
    getStudentTestCategories,
} from "@/features/tests/server/get-student-test-categories";

export default async function TestsRoute() {
    const categories =
        await getStudentTestCategories();

    return (
        <TestsPage
            grammarCategories={
                categories.grammar
            }
            nationalCertificateCategories={
                categories.nationalCertificate
            }
        />
    );
}
