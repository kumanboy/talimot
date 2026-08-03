import {
    getNationalTestsByTopic,
} from "@/features/national-certificate/api/get-national-tests";

import {
    NationalTestCollectionPage,
} from "@/features/national-certificate/components/national-test-collection-page";

export default async function MixedTestsCollectionsRoute() {
    const collections =
        await getNationalTestsByTopic(
            "aralash",
        );

    return (
        <NationalTestCollectionPage
            categoryLabel="Milliy sertifikat"
            title="Aralash testlar"
            description="Har bir testda grammatika, punktuatsiya, sintaksis, uslubiyat, leksikologiya va adabiyotga doir turli formatdagi topshiriqlar mavjud."
            collections={collections}
        />
    );
}