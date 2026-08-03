import type {
    PlannedStandardTest,
} from "@/features/tests/model/test-summary";

export const plannedStandardTests = [
    // IMLO

    {
        id: "spelling-type-1",
        slug: "1-tip",

        title: "Imlo — 1-tip",
        description:
            "Imloviy jihatdan to‘g‘ri yozilgan so‘zlar qatorini aniqlash.",

        category: "Imlo",
        topicSlug: "imlo",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "medium",
        access: "free",
    },

    {
        id: "spelling-type-2",
        slug: "2-tip",

        title: "Imlo — 2-tip",
        description:
            "Imlo qoidalariga doir ikkinchi turdagi savollar to‘plami.",

        category: "Imlo",
        topicSlug: "imlo",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "medium",
        access: "free",
    },

    {
        id: "spelling-type-3",
        slug: "3-tip",

        title: "Imlo — 3-tip",
        description:
            "Imlo qoidalariga doir uchinchi turdagi savollar to‘plami.",

        category: "Imlo",
        topicSlug: "imlo",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "medium",
        access: "premium",
    },

    {
        id: "spelling-type-4",
        slug: "4-tip",

        title: "Imlo — 4-tip",
        description:
            "Imlo qoidalariga doir murakkab savollar to‘plami.",

        category: "Imlo",
        topicSlug: "imlo",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "hard",
        access: "premium",
    },

    // MORFEMIKA

    {
        id: "morphemics-type-1",
        slug: "1-tip",

        title: "Morfemika — 1-tip",
        description:
            "So‘z tarkibi, asos va qo‘shimchalarni aniqlashga doir test.",

        category: "Morfemika",
        topicSlug: "morfemika",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "easy",
        access: "free",
    },

    {
        id: "morphemics-type-2",
        slug: "2-tip",

        title: "Morfemika — 2-tip",
        description:
            "So‘z yasovchi va shakl yasovchi qo‘shimchalarga doir test.",

        category: "Morfemika",
        topicSlug: "morfemika",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "medium",
        access: "free",
    },

    {
        id: "morphemics-type-3",
        slug: "3-tip",

        title: "Morfemika — 3-tip",
        description:
            "So‘z tarkibining murakkab holatlariga doir test.",

        category: "Morfemika",
        topicSlug: "morfemika",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "hard",
        access: "premium",
    },

    // LEKSIKOLOGIYA

    {
        id: "lexicology-type-1",
        slug: "1-tip",

        title: "Leksikologiya — 1-tip",
        description:
            "So‘z ma’nosi va leksik birliklarga doir test.",

        category: "Leksikologiya",
        topicSlug: "leksikologiya",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "easy",
        access: "free",
    },

    {
        id: "lexicology-type-2",
        slug: "2-tip",

        title: "Leksikologiya — 2-tip",
        description:
            "Sinonim, antonim, omonim va paronimlarga doir test.",

        category: "Leksikologiya",
        topicSlug: "leksikologiya",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "medium",
        access: "free",
    },

    {
        id: "lexicology-type-3",
        slug: "3-tip",

        title: "Leksikologiya — 3-tip",
        description:
            "Ko‘chma ma’no va leksik tahlilga doir murakkab test.",

        category: "Leksikologiya",
        topicSlug: "leksikologiya",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "hard",
        access: "premium",
    },

    // USLUBIYAT

    {
        id: "stylistics-type-1",
        slug: "1-tip",

        title: "Uslubiyat — 1-tip",
        description:
            "Nutq uslublari va ularning xususiyatlariga doir test.",

        category: "Uslubiyat",
        topicSlug: "uslubiyat",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "easy",
        access: "free",
    },

    {
        id: "stylistics-type-2",
        slug: "2-tip",

        title: "Uslubiyat — 2-tip",
        description:
            "Uslubiy xato va ifoda vositalariga doir test.",

        category: "Uslubiyat",
        topicSlug: "uslubiyat",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "medium",
        access: "free",
    },

    {
        id: "stylistics-type-3",
        slug: "3-tip",

        title: "Uslubiyat — 3-tip",
        description:
            "Matn uslubi va murakkab uslubiy tahlilga doir test.",

        category: "Uslubiyat",
        topicSlug: "uslubiyat",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "hard",
        access: "premium",
    },

    // MORFOLOGIYA

    {
        id: "morphology-type-1",
        slug: "1-tip",

        title: "Morfologiya — 1-tip",
        description:
            "So‘z turkumlarini aniqlashga doir test.",

        category: "Morfologiya",
        topicSlug: "morfologiya",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "easy",
        access: "free",
    },

    {
        id: "morphology-type-2",
        slug: "2-tip",

        title: "Morfologiya — 2-tip",
        description:
            "Ot, sifat, son, olmosh va ravishga doir test.",

        category: "Morfologiya",
        topicSlug: "morfologiya",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "medium",
        access: "free",
    },

    {
        id: "morphology-type-3",
        slug: "3-tip",

        title: "Morfologiya — 3-tip",
        description:
            "Fe’l va yordamchi so‘zlarga doir test.",

        category: "Morfologiya",
        topicSlug: "morfologiya",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "medium",
        access: "premium",
    },

    {
        id: "morphology-type-4",
        slug: "4-tip",

        title: "Morfologiya — 4-tip",
        description:
            "Morfologik tahlilga doir murakkab test.",

        category: "Morfologiya",
        topicSlug: "morfologiya",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "hard",
        access: "premium",
    },

    // SINTAKSIS

    {
        id: "syntax-type-1",
        slug: "1-tip",

        title: "Sintaksis — 1-tip",
        description:
            "So‘z birikmasi va gap bo‘laklariga doir test.",

        category: "Sintaksis",
        topicSlug: "sintaksis",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "easy",
        access: "free",
    },

    {
        id: "syntax-type-2",
        slug: "2-tip",

        title: "Sintaksis — 2-tip",
        description:
            "Sodda gap va uning turlariga doir test.",

        category: "Sintaksis",
        topicSlug: "sintaksis",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "medium",
        access: "free",
    },

    {
        id: "syntax-type-3",
        slug: "3-tip",

        title: "Sintaksis — 3-tip",
        description:
            "Qo‘shma gap va sintaktik bog‘lanishlarga doir test.",

        category: "Sintaksis",
        topicSlug: "sintaksis",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "medium",
        access: "premium",
    },

    {
        id: "syntax-type-4",
        slug: "4-tip",

        title: "Sintaksis — 4-tip",
        description:
            "Murakkab sintaktik tahlilga doir test.",

        category: "Sintaksis",
        topicSlug: "sintaksis",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "hard",
        access: "premium",
    },

    // PUNKTUATSIYA

    {
        id: "punctuation-type-1",
        slug: "1-tip",

        title: "Punktuatsiya — 1-tip",
        description:
            "Asosiy tinish belgilarining qo‘llanishiga doir test.",

        category: "Punktuatsiya",
        topicSlug: "punktuatsiya",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "easy",
        access: "free",
    },

    {
        id: "punctuation-type-2",
        slug: "2-tip",

        title: "Punktuatsiya — 2-tip",
        description:
            "Vergul, tire va ikki nuqtaning qo‘llanishiga doir test.",

        category: "Punktuatsiya",
        topicSlug: "punktuatsiya",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "medium",
        access: "free",
    },

    {
        id: "punctuation-type-3",
        slug: "3-tip",

        title: "Punktuatsiya — 3-tip",
        description:
            "Murakkab gaplarda tinish belgilariga doir test.",

        category: "Punktuatsiya",
        topicSlug: "punktuatsiya",

        questionCount: 20,
        estimatedMinutes: 20,

        difficulty: "hard",
        access: "premium",
    },
] as const satisfies readonly PlannedStandardTest[];

export function getPlannedTestsByTopic(
    topicSlug: string,
) {
    return plannedStandardTests.filter(
        (test) =>
            test.topicSlug === topicSlug,
    );
}