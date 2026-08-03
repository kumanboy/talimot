import {
    getNationalTestsByTopic,
} from "@/features/national-certificate/api/get-national-tests";

import {
    NationalTestCollectionPage,
} from "@/features/national-certificate/components/national-test-collection-page";

export default async function ScientificTextTestsRoute() {
    const collections =
        await getNationalTestsByTopic(
            "ilmiy-matn",
        );

    return (
        <NationalTestCollectionPage
            categoryLabel="Milliy sertifikat"
            title="Ilmiy matn"
            description="Har bir testda bitta ilmiy matn va uning mazmuni, tuzilishi hamda xulosalariga doir 5 ta savol mavjud."
            collections={collections}
        />
    );
}