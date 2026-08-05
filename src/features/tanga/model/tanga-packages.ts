import type {
    TangaPackageDefinition,
} from "./tanga-package-types";

export const tangaPackages:
    readonly TangaPackageDefinition[] = [
        {
            id: "starter",
            amount: 7,
            price: 21000,
            description:
                "Bir nechta test yoki esse tekshiruvi uchun qulay boshlang‘ich paket.",
            recommended: false,
        },
        {
            id: "standard",
            amount: 15,
            price: 40000,
            badge: "ENG OMMABOP",
            description:
                "Muntazam tayyorgarlik va xizmatlardan foydalanish uchun optimal paket.",
            recommended: true,
        },
        {
            id: "maximum",
            amount: 30,
            price: 88000,
            badge: "KATTA PAKET",
            description:
                "Ko‘proq test, esse va sinov xizmatlaridan foydalanadiganlar uchun.",
            recommended: false,
        },
    ];
