import {
    getStandardTestsByTopic,
} from "@/features/tests/api/get-standard-tests";

import {
    TestCollectionPage,
} from "@/features/tests/components/test-collection-page";

export default async function LexicologyTestsRoute() {
    const collections =
        await getStandardTestsByTopic(
            "leksikologiya",
        );

    return (
        <TestCollectionPage
            categoryLabel="Grammatika"
            title="Leksikologiya"
            description="So‘z ma’nolari, sinonim, antonim, omonim va leksik birliklarni testlar orqali o‘rganing."
            collections={collections}
        />
    );
}