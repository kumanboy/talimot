import type {
    TangaPackageDefinition,
} from "./tanga-package-types";

export const tangaPackages:
    readonly TangaPackageDefinition[] = [
        {
            id: "starter",
            name: "Boshlang‘ich",
            amount: 7,
            price: 20000,
            description:
                "Bir nechta test yoki esse tekshiruvi uchun qulay boshlang‘ich tarif.",
            recommended: false,
        },
        {
            id: "standard",
            name: "Standart",
            amount: 15,
            price: 40000,
            badge: "ENG OMMABOP",
            description:
                "Muntazam tayyorgarlik va xizmatlardan foydalanish uchun optimal tarif.",
            recommended: true,
        },
        {
            id: "maximum",
            name: "Maksimal",
            amount: 30,
            price: 88000,
            badge: "KATTA PAKET",
            description:
                "Ko‘proq test, esse va sinov xizmatlaridan foydalanadiganlar uchun.",
            recommended: false,
        },
    ];
