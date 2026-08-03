import {
    getNationalTestsByTopic,
} from "@/features/national-certificate/api/get-national-tests";

import {
    NationalTestCollectionPage,
} from "@/features/national-certificate/components/national-test-collection-page";

export default async function LiteraryWorksCollectionsRoute() {
    const collections =
        await getNationalTestsByTopic(
            "badiiy-asarlar",
        );

    return (
        <NationalTestCollectionPage
            categoryLabel="Milliy sertifikat"
            title="Badiiy asarlar"
            description="Har bir testda adiblar, asarlar, qahramonlar va she’riy parchalar bo‘yicha 5 ta mustaqil savol mavjud."
            collections={collections}
        />
    );
}