import {
    getStandardTestsByTopic,
} from "@/features/tests/api/get-standard-tests";

import {
    TestCollectionPage,
} from "@/features/tests/components/test-collection-page";

export default async function SyntaxTestsRoute() {
    const collections =
        await getStandardTestsByTopic(
            "sintaksis",
        );

    return (
        <TestCollectionPage
            categoryLabel="Grammatika"
            title="Sintaksis"
            description="So‘z birikmasi, gap bo‘laklari va gap turlariga doir bilimlaringizni testlar orqali mustahkamlang."
            collections={collections}
        />
    );
}