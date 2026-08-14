import type {
    NationalTestTopic,
    PlannedNationalTest,
} from "./national-test-types";

export const plannedNationalTests:
    readonly PlannedNationalTest[] = [
    {
        id: "diagnostic-test-1",
        slug: "1",

        title:
            "To‘liq diagnostika — 1",

        description:
            "45 ta savol, 180 daqiqa va 1 ta esse topshirig‘idan iborat to‘liq diagnostika imtihoni.",

        topic:
            "diagnostika",

        format:
            "diagnostic",

        questionCount: 45,
        estimatedMinutes: 180,

        difficulty: "hard",
        access: "free",
    },

    {
        id: "mixed-test-1",
        slug: "1",

        title: "Aralash test — 1",

        description:
            "Grammatika, punktuatsiya, sintaksis, uslubiyat va adabiyotga doir aralash topshiriqlar.",

        topic: "aralash",
        format: "mixed",

        questionCount: 14,
        estimatedMinutes: 35,

        difficulty: "medium",
        access: "free",
    },
    {
        id: "ghazal-1",
        slug: "1",
        topic: "gazal",
        format: "passage-five",
        title: "G‘azal — 1",
        description:
            "G‘azal tahlili bo‘yicha 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 15,
        difficulty: "easy",
        access: "free",
    },
    {
        id: "ghazal-2",
        slug: "2",
        topic: "gazal",
        format: "passage-five",
        title: "G‘azal — 2",
        description:
            "G‘azal tahlili bo‘yicha 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 15,
        difficulty: "medium",
        access: "free",
    },
    {
        id: "ghazal-3",
        slug: "3",
        topic: "gazal",
        format: "passage-five",
        title: "G‘azal — 3",
        description:
            "G‘azal tahlili bo‘yicha 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 15,
        difficulty: "medium",
        access: "premium",
    },
    {
        id: "ghazal-4",
        slug: "4",
        topic: "gazal",
        format: "passage-five",
        title: "G‘azal — 4",
        description:
            "G‘azal tahlili bo‘yicha 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 15,
        difficulty: "hard",
        access: "premium",
    },
    {
        id: "ghazal-5",
        slug: "5",
        topic: "gazal",
        format: "passage-five",
        title: "G‘azal — 5",
        description:
            "G‘azal tahlili bo‘yicha 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 15,
        difficulty: "hard",
        access: "premium",
    },

    {
        id: "scientific-text-1",
        slug: "1",
        topic: "ilmiy-matn",
        format: "passage-five",
        title: "Ilmiy matn — 1",
        description:
            "Merkuriy haqidagi matn asosida 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 15,
        difficulty: "easy",
        access: "free",
    },
    {
        id: "scientific-text-2",
        slug: "2",
        topic: "ilmiy-matn",
        format: "passage-five",
        title: "Ilmiy matn — 2",
        description:
            "Ilmiy matn tahlili bo‘yicha 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 15,
        difficulty: "medium",
        access: "free",
    },
    {
        id: "scientific-text-3",
        slug: "3",
        topic: "ilmiy-matn",
        format: "passage-five",
        title: "Ilmiy matn — 3",
        description:
            "Ilmiy matn tahlili bo‘yicha 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 15,
        difficulty: "medium",
        access: "premium",
    },
    {
        id: "scientific-text-4",
        slug: "4",
        topic: "ilmiy-matn",
        format: "passage-five",
        title: "Ilmiy matn — 4",
        description:
            "Ilmiy matn tahlili bo‘yicha 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 15,
        difficulty: "hard",
        access: "premium",
    },
    {
        id: "scientific-text-5",
        slug: "5",
        topic: "ilmiy-matn",
        format: "passage-five",
        title: "Ilmiy matn — 5",
        description:
            "Ilmiy matn tahlili bo‘yicha 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 15,
        difficulty: "hard",
        access: "premium",
    },

    {
        id: "literary-text-1",
        slug: "1",
        topic: "badiiy-matn",
        format: "passage-five",
        title: "Badiiy matn — 1",
        description:
            "“Tanho qayiq” asari asosida 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 18,
        difficulty: "easy",
        access: "free",
    },
    {
        id: "literary-text-2",
        slug: "2",
        topic: "badiiy-matn",
        format: "passage-five",
        title: "Badiiy matn — 2",
        description:
            "Badiiy matn tahlili bo‘yicha 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 18,
        difficulty: "medium",
        access: "free",
    },
    {
        id: "literary-text-3",
        slug: "3",
        topic: "badiiy-matn",
        format: "passage-five",
        title: "Badiiy matn — 3",
        description:
            "Badiiy matn tahlili bo‘yicha 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 18,
        difficulty: "medium",
        access: "premium",
    },
    {
        id: "literary-text-4",
        slug: "4",
        topic: "badiiy-matn",
        format: "passage-five",
        title: "Badiiy matn — 4",
        description:
            "Badiiy matn tahlili bo‘yicha 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 18,
        difficulty: "hard",
        access: "premium",
    },
    {
        id: "literary-text-5",
        slug: "5",
        topic: "badiiy-matn",
        format: "passage-five",
        title: "Badiiy matn — 5",
        description:
            "Badiiy matn tahlili bo‘yicha 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 18,
        difficulty: "hard",
        access: "premium",
    },
    {
        id: "literary-works-1",
        slug: "1",
        topic: "badiiy-asarlar",
        format: "standard-five",
        title: "Badiiy asarlar — 1",
        description:
            "Adiblar, asarlar va qahramonlarga doir 5 ta savol.",
        questionCount: 5,
        estimatedMinutes: 12,
        difficulty: "easy",
        access: "free",
    },
    {
        id: "literary-works-2",
        slug: "2",
        topic: "badiiy-asarlar",
        format: "standard-five",
        title: "Badiiy asarlar — 2",
        description:
            "Badiiy asarlar bo‘yicha 5 ta mustaqil savol.",
        questionCount: 5,
        estimatedMinutes: 12,
        difficulty: "medium",
        access: "free",
    },
    {
        id: "literary-works-3",
        slug: "3",
        topic: "badiiy-asarlar",
        format: "standard-five",
        title: "Badiiy asarlar — 3",
        description:
            "Badiiy asarlar bo‘yicha 5 ta mustaqil savol.",
        questionCount: 5,
        estimatedMinutes: 12,
        difficulty: "medium",
        access: "premium",
    },
    {
        id: "literary-works-4",
        slug: "4",
        topic: "badiiy-asarlar",
        format: "standard-five",
        title: "Badiiy asarlar — 4",
        description:
            "Badiiy asarlar bo‘yicha 5 ta mustaqil savol.",
        questionCount: 5,
        estimatedMinutes: 12,
        difficulty: "hard",
        access: "premium",
    },
    {
        id: "literary-works-5",
        slug: "5",
        topic: "badiiy-asarlar",
        format: "standard-five",
        title: "Badiiy asarlar — 5",
        description:
            "Badiiy asarlar bo‘yicha 5 ta mustaqil savol.",
        questionCount: 5,
        estimatedMinutes: 12,
        difficulty: "hard",
        access: "premium",
    },

];

export function getPlannedNationalTestsByTopic(
    topic: NationalTestTopic,
): readonly PlannedNationalTest[] {
    return plannedNationalTests.filter(
        (test) =>
            test.topic === topic,
    );
}