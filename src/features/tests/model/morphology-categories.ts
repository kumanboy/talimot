import type {
    TestCategoryIcon,
} from "@/features/tests/model/types";

export type MorphologySubtopicSlug =
    | "ot"
    | "sifat"
    | "son"
    | "olmosh"
    | "ravish"
    | "fel"
    | "komakchi"
    | "boglovchi"
    | "yuklama";

export interface MorphologyCategory {
    readonly id: string;

    readonly slug:
        MorphologySubtopicSlug;

    readonly title: string;
    readonly description: string;

    readonly href: string;

    readonly itemCountLabel:
        string;

    readonly icon:
        TestCategoryIcon;

    readonly isAvailable:
        boolean;

    readonly featured?:
        boolean;
}

export const morphologyCategories:
    readonly MorphologyCategory[] =
    [
        {
            id:
                "morphology-noun",

            slug:
                "ot",

            title:
                "Ot",

            description:
                "Ot so‘z turkumi, uning turlari, shakllari va grammatik xususiyatlariga doir testlar.",

            href:
                "/tests/grammatika/morfologiya/ot",

            itemCountLabel:
                "1 ta test",

            icon:
                "morphology",

            isAvailable:
                true,

            featured:
                true,
        },

        {
            id:
                "morphology-adjective",

            slug:
                "sifat",

            title:
                "Sifat",

            description:
                "Sifatning ma’no turlari, darajalari va gapdagi vazifalariga doir testlar.",

            href:
                "/tests/grammatika/morfologiya/sifat",

            itemCountLabel:
                "Tez orada",

            icon:
                "morphology",

            isAvailable:
                false,
        },

        {
            id:
                "morphology-number",

            slug:
                "son",

            title:
                "Son",

            description:
                "Sonning ma’no turlari, tuzilishi va grammatik xususiyatlariga doir testlar.",

            href:
                "/tests/grammatika/morfologiya/son",

            itemCountLabel:
                "Tez orada",

            icon:
                "morphology",

            isAvailable:
                false,
        },

        {
            id:
                "morphology-pronoun",

            slug:
                "olmosh",

            title:
                "Olmosh",

            description:
                "Olmosh turlari, ularning ma’nosi va gapda qo‘llanishiga doir testlar.",

            href:
                "/tests/grammatika/morfologiya/olmosh",

            itemCountLabel:
                "Tez orada",

            icon:
                "morphology",

            isAvailable:
                false,
        },

        {
            id:
                "morphology-adverb",

            slug:
                "ravish",

            title:
                "Ravish",

            description:
                "Ravishning ma’no turlari, yasalishi va gapdagi vazifalariga doir testlar.",

            href:
                "/tests/grammatika/morfologiya/ravish",

            itemCountLabel:
                "Tez orada",

            icon:
                "morphology",

            isAvailable:
                false,
        },

        {
            id:
                "morphology-verb",

            slug:
                "fel",

            title:
                "Fe’l",

            description:
                "Fe’l shakllari, mayl, zamon, nisbat va vazifadosh shakllarga doir testlar.",

            href:
                "/tests/grammatika/morfologiya/fel",

            itemCountLabel:
                "Tez orada",

            icon:
                "morphology",

            isAvailable:
                false,
        },

        {
            id:
                "morphology-postposition",

            slug:
                "komakchi",

            title:
                "Ko‘makchi",

            description:
                "Ko‘makchilar, ularning ma’no munosabatlari va qo‘llanishiga doir testlar.",

            href:
                "/tests/grammatika/morfologiya/komakchi",

            itemCountLabel:
                "Tez orada",

            icon:
                "morphology",

            isAvailable:
                false,
        },

        {
            id:
                "morphology-conjunction",

            slug:
                "boglovchi",

            title:
                "Bog‘lovchi",

            description:
                "Bog‘lovchilarning turlari va gap bo‘laklarini bog‘lash xususiyatlariga doir testlar.",

            href:
                "/tests/grammatika/morfologiya/boglovchi",

            itemCountLabel:
                "Tez orada",

            icon:
                "morphology",

            isAvailable:
                false,
        },

        {
            id:
                "morphology-particle",

            slug:
                "yuklama",

            title:
                "Yuklama",

            description:
                "Yuklamalarning ma’no turlari va gapga qo‘shadigan qo‘shimcha ma’nolariga doir testlar.",

            href:
                "/tests/grammatika/morfologiya/yuklama",

            itemCountLabel:
                "Tez orada",

            icon:
                "morphology",

            isAvailable:
                false,
        },
    ];

export function isMorphologySubtopicSlug(
    value: string,
): value is MorphologySubtopicSlug {
    return morphologyCategories.some(
        (
            category,
        ) =>
            category.slug ===
            value,
    );
}

export function getMorphologyCategory(
    slug: string,
): MorphologyCategory | null {
    return (
        morphologyCategories.find(
            (
                category,
            ) =>
                category.slug ===
                slug,
        ) ?? null
    );
}