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
                "Platformani sinab ko‘rish va bir nechta pullik xizmatdan foydalanish uchun.",
            usageExamples: [
                "7 ta mavzu testi",
                "3 ta diagnostika / mock + 1 ta mavzu testi",
                "2 ta AI esse tekshiruvi + 1 ta mavzu testi",
                "1 ta ustoz esse tekshiruvi + 1 ta mavzu testi",
            ],
            recommended: false,
        },
        {
            id: "standard",
            name: "Standart",
            amount: 16,
            price: 40000,
            badge: "ENG OMMABOP",
            description:
                "Muntazam tayyorgarlik qiladigan foydalanuvchilar uchun eng muvozanatli paket.",
            usageExamples: [
                "16 ta mavzu testi",
                "8 ta diagnostika / mock",
                "5 ta AI esse tekshiruvi + 1 ta mavzu testi",
                "2 ta ustoz esse tekshiruvi + 4 ta mavzu testi",
            ],
            recommended: true,
        },
        {
            id: "maximum",
            name: "Maksimal",
            amount: 36,
            price: 80000,
            badge: "ENG FOYDALI",
            description:
                "Ko‘p test ishlaydigan va esselarini muntazam tekshirtiradiganlar uchun.",
            usageExamples: [
                "36 ta mavzu testi",
                "18 ta diagnostika / mock",
                "12 ta AI esse tekshiruvi",
                "6 ta ustoz esse tekshiruvi",
            ],
            recommended: false,
        },
    ];
