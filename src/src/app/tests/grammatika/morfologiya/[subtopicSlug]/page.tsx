import {
    notFound,
} from "next/navigation";

import {
    getMorphologyCategory,
    isMorphologySubtopicSlug,
} from "@/features/tests/model/morphology-categories";
import {
    getStudentMorphologyTestsBySubtopic,
} from "@/features/tests/api/get-morphology-tests";
import {
    MorphologyTestCollectionPage,
} from "@/features/tests/components/morphology-test-collection-page";

type MorphologySubtopicRouteProps = {
    readonly params: Promise<{
        subtopicSlug: string;
    }>;
};

export default async function MorphologySubtopicRoute({
    params,
}: MorphologySubtopicRouteProps) {
    const {
        subtopicSlug,
    } = await params;

    if (
        !isMorphologySubtopicSlug(
            subtopicSlug,
        )
    ) {
        notFound();
    }

    const category =
        getMorphologyCategory(
            subtopicSlug,
        );

    if (!category) {
        notFound();
    }

    const collections =
        await getStudentMorphologyTestsBySubtopic(
            subtopicSlug,
        );

    return (
        <MorphologyTestCollectionPage
            category={category}
            collections={collections}
        />
    );
}
