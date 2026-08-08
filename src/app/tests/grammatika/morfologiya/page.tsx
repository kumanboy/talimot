import {
    getStudentMorphologyCategories,
} from "@/features/tests/api/get-morphology-categories";
import {
    MorphologyPageClient,
} from "./morphology-page-client";

export default async function MorphologyTestsRoute() {
    const categories =
        await getStudentMorphologyCategories();

    return (
        <MorphologyPageClient
            categories={categories}
        />
    );
}
