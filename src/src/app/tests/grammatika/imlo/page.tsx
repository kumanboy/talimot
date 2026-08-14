import {
    getStandardTestsByTopic,
} from "@/features/tests/api/get-standard-tests";

import {
    TestCollectionPage,
} from "@/features/tests/components/test-collection-page";

export default async function SpellingTestsRoute() {
    const collections =
        await getStandardTestsByTopic(
            "imlo",
        );

    return (
        <TestCollectionPage
            categoryLabel="Grammatika"
            title="Imlo"
            description="To‘g‘ri yozish qoidalarini mavzulashtirilgan testlar orqali mustahkamlang."
            collections={collections}
        />
    );
}