import {
    getStandardTestsByTopic,
} from "@/features/tests/api/get-standard-tests";

import {
    TestCollectionPage,
} from "@/features/tests/components/test-collection-page";

export default async function StylisticsTestsRoute() {
    const collections =
        await getStandardTestsByTopic(
            "uslubiyat",
        );

    return (
        <TestCollectionPage
            categoryLabel="Grammatika"
            title="Uslubiyat"
            description="Nutq uslublari, uslubiy xatolar va matnning ifoda imkoniyatlarini testlar orqali mustahkamlang."
            collections={collections}
        />
    );
}