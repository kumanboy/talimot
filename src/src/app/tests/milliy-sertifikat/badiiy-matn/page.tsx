import {
    getNationalTestsByTopic,
} from "@/features/national-certificate/api/get-national-tests";

import {
    NationalTestCollectionPage,
} from "@/features/national-certificate/components/national-test-collection-page";

export default async function LiteraryTextTestsRoute() {
    const collections =
        await getNationalTestsByTopic(
            "badiiy-matn",
        );

    return (
        <NationalTestCollectionPage
            categoryLabel="Milliy sertifikat"
            title="Badiiy matn"
            description="Har bir testda bitta badiiy matn va uning g‘oyasi, obrazlari hamda uslubiy ma’nosiga doir 5 ta savol mavjud."
            collections={collections}
        />
    );
}