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
            description="Bilimingizni 45 ta savol, yozma topshiriqlar va esse orqali to‘liq tekshiring. Natijada kuchli va rivojlantirilishi kerak bo‘lgan bo‘limlaringiz aniqlanadi."
            collections={collections}
        />
    );
}