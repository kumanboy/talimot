import {
    getStandardTestsByTopic,
} from "@/features/tests/api/get-standard-tests";

import {
    TestCollectionPage,
} from "@/features/tests/components/test-collection-page";

export default async function MorphemicsTestsRoute() {
    const collections =
        await getStandardTestsByTopic(
            "morfemika",
        );

    return (
        <TestCollectionPage
            categoryLabel="Grammatika"
            title="Morfemika"
            description="So‘z tarkibi, asos va qo‘shimchalar bo‘yicha bilimlaringizni testlar orqali mustahkamlang."
            collections={collections}
        />
    );
}