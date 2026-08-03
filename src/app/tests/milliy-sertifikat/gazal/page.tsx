import {
    getNationalTestsByTopic,
} from "@/features/national-certificate/api/get-national-tests";

import {
    NationalTestCollectionPage,
} from "@/features/national-certificate/components/national-test-collection-page";

export default async function GhazalTestsRoute() {
    const collections =
        await getNationalTestsByTopic(
            "gazal",
        );

    return (
        <NationalTestCollectionPage
            categoryLabel="Milliy sertifikat"
            title="G‘azal"
            description="Har bir testda bitta g‘azal, lug‘at va g‘azal mazmuni, baytlar tahlili hamda badiiy san’atlarga doir 5 ta savol mavjud."
            collections={
                collections
            }
        />
    );
}