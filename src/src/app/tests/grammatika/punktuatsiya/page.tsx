import {
    getStandardTestsByTopic,
} from "@/features/tests/api/get-standard-tests";

import {
    TestCollectionPage,
} from "@/features/tests/components/test-collection-page";

export default async function PunctuationTestsRoute() {
    const collections =
        await getStandardTestsByTopic(
            "punktuatsiya",
        );

    return (
        <TestCollectionPage
            categoryLabel="Grammatika"
            title="Punktuatsiya"
            description="Tinish belgilarining qo‘llanish qoidalarini mavzulashtirilgan testlar orqali mustahkamlang."
            collections={collections}
        />
    );
}