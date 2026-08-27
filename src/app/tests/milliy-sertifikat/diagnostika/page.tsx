import {
    getNationalTestsByTopic,
} from "@/features/national-certificate/api/get-national-tests";

import {
    NationalTestCollectionPage,
} from "@/features/national-certificate/components/national-test-collection-page";

export default async function DiagnosticTestsCollectionsRoute() {
    const collections =
        await getNationalTestsByTopic(
            "diagnostika",
        );

    return (
        <NationalTestCollectionPage
            categoryLabel="Milliy sertifikat"
            title="Diagnostika testlari"
            description="Bilimingizni 44 ta baholanadigan topshiriq va 45-esse mavzusi bilan to‘liq tekshiring. Esse saytda yozilmaydi; avvalgi esse natijangiz bo‘lsa, yakunda ixtiyoriy ravishda kirita olasiz."
            collections={collections}
        />
    );
}