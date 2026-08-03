import type {
    TestCategory,
} from "./types";

export const grammarTestCategories = [
    {
        id: "spelling",
        title: "Imlo",
        description:
            "To‘g‘ri yozish qoidalariga doir savollar",
        href:
            "/tests/grammatika/imlo",
        icon: "spelling",
        group: "grammar",
        itemCountLabel:
            "12 ta test to‘plami",
    },
    {
        id: "morphemics",
        title: "Morfemika",
        description:
            "So‘z tarkibi, asos va qo‘shimchalarga doir savollar",
        href:
            "/tests/grammatika/morfemika",
        icon: "morphemics",
        group: "grammar",
        itemCountLabel:
            "8 ta test to‘plami",
    },
    {
        id: "lexicology",
        title: "Leksikologiya",
        description:
            "So‘z ma’nosi va lug‘aviy munosabatlarga doir savollar",
        href:
            "/tests/grammatika/leksikologiya",
        icon: "lexicology",
        group: "grammar",
        itemCountLabel:
            "10 ta test to‘plami",
    },
    {
        id: "stylistics",
        title: "Uslubiyat",
        description:
            "Nutq uslublari va uslubiy xatolarga doir savollar",
        href:
            "/tests/grammatika/uslubiyat",
        icon: "stylistics",
        group: "grammar",
        itemCountLabel:
            "8 ta test to‘plami",
    },
    {
        id: "morphology",
        title: "Morfologiya",
        description:
            "Mustaqil, yordamchi va alohida so‘z turkumlari",
        href:
            "/tests/grammatika/morfologiya",
        icon: "morphology",
        group: "grammar",
        itemCountLabel:
            "12 ta ichki bo‘lim",
        featured: true,
    },
    {
        id: "syntax",
        title: "Sintaksis",
        description:
            "So‘z birikmasi, gap bo‘laklari va gap qurilishi",
        href:
            "/tests/grammatika/sintaksis",
        icon: "syntax",
        group: "grammar",
        itemCountLabel:
            "14 ta test to‘plami",
    },
    {
        id: "punctuation",
        title: "Punktuatsiya",
        description:
            "Tinish belgilarining qo‘llanishiga doir savollar",
        href:
            "/tests/grammatika/punktuatsiya",
        icon: "punctuation",
        group: "grammar",
        itemCountLabel:
            "8 ta test to‘plami",
    },
] as const satisfies readonly TestCategory[];

export const nationalCertificateTestCategories = [
    {
        id: "ghazal",
        title: "G‘azal",
        description:
            "Bitta g‘azal va unga asoslangan 5 ta tahliliy savol",
        href:
            "/tests/milliy-sertifikat/gazal",
        icon: "ghazal",
        group:
            "national-certificate",
        itemCountLabel:
            "10 ta test to‘plami",
    },
    {
        id: "scientific-text",
        title: "Ilmiy matn",
        description:
            "Bitta ilmiy matn va unga asoslangan 5 ta savol",
        href:
            "/tests/milliy-sertifikat/ilmiy-matn",
        icon: "scientific-text",
        group:
            "national-certificate",
        itemCountLabel:
            "8 ta test to‘plami",
    },
    {
        id: "literary-text",
        title: "Badiiy matn",
        description:
            "Bitta badiiy matn va unga asoslangan 5 ta savol",
        href:
            "/tests/milliy-sertifikat/badiiy-matn",
        icon: "literary-text",
        group:
            "national-certificate",
        itemCountLabel:
            "8 ta test to‘plami",
    },
    {
        id: "literature",
        title: "Badiiy asarlar",
        description:
            "Adiblar, asarlar va qahramonlarga doir 5 ta savol",
        href:
            "/tests/milliy-sertifikat/badiiy-asarlar",
        icon: "literature",
        group:
            "national-certificate",
        itemCountLabel:
            "12 ta test to‘plami",
    },
    {
        id: "mixed",
        title: "Aralash savollar",
        description:
            "Milliy sertifikatning turli bo‘limlariga doir savollar",
        href:
            "/tests/milliy-sertifikat/aralash",
        icon: "mixed",
        group:
            "national-certificate",
        itemCountLabel:
            "15 ta test to‘plami",
    },
    {
        id: "diagnostics",
        title:
            "To‘liq diagnostika imtihonlar to‘plami",
        description:
            "To‘liq imtihon formatidagi diagnostika testlari",
        href:
            "/tests/milliy-sertifikat/diagnostika",
        /**
         * Existing icon name is preserved
         * to avoid breaking TestCategoryIcon.
         */
        icon: "mock",
        group:
            "national-certificate",
        itemCountLabel:
            "Diagnostika testlari",
        featured: true,
    },
] as const satisfies readonly TestCategory[];

export const allTestCategories = [
    ...grammarTestCategories,
    ...nationalCertificateTestCategories,
] as const;