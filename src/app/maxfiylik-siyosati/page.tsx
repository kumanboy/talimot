import type { Metadata } from "next";

import {
    LegalPage,
} from "@/features/legal/components/legal-page";

export const metadata: Metadata = {
    title: "Maxfiylik siyosati | TA’LIMOT",
    description:
        "TA’LIMOT platformasining maxfiylik siyosati.",
};

export default function PrivacyPage() {
    return (
        <LegalPage
            eyebrow="MAXFIYLIK"
            title="Maxfiylik siyosati"
            description="Ushbu sahifada foydalanuvchi ma’lumotlari qanday maqsadda ishlatilishi haqida umumiy ma’lumot beriladi."
            updatedAt="Oxirgi yangilanish: 4-avgust, 2026-yil"
            sections={[
                {
                    title: "1. Qanday ma’lumotlar olinishi mumkin?",
                    items: [
                        "Ism va familiya",
                        "Telefon raqami",
                        "Telegram foydalanuvchi nomi",
                        "Test va o‘quv faoliyati natijalari",
                        "Buyurtma va xizmat bilan bog‘liq ma’lumotlar",
                    ],
                },
                {
                    title: "2. Ma’lumotlardan foydalanish",
                    paragraphs: [
                        "Ma’lumotlar foydalanuvchini tanish, xizmat ko‘rsatish, buyurtmani qayta ishlash, kurs yoki yopiq guruhga qo‘shish hamda platforma faoliyatini yaxshilash uchun ishlatilishi mumkin.",
                    ],
                },
                {
                    title: "3. Ma’lumotlarni himoya qilish",
                    paragraphs: [
                        "Foydalanuvchi ma’lumotlariga ruxsatsiz kirish, ularni yo‘qotish yoki noto‘g‘ri ishlatish xavfini kamaytirish uchun texnik va tashkiliy himoya choralaridan foydalaniladi.",
                        "Internet orqali ma’lumot uzatish mutlaq xavfsiz bo‘lishi kafolatlanmaydi, biroq xavfsizlikni muntazam yaxshilashga harakat qilinadi.",
                    ],
                },
                {
                    title: "4. Uchinchi tomon xizmatlari",
                    paragraphs: [
                        "Telegram, Instagram, to‘lov yoki yetkazib berish xizmatlariga o‘tilganda ularning o‘z maxfiylik qoidalari amal qiladi.",
                    ],
                },
                {
                    title: "5. Murojaat qilish",
                    paragraphs: [
                        "Shaxsiy ma’lumotlar yoki maxfiylik bo‘yicha savollar yuzasidan yordam bo‘limi orqali administratorga murojaat qilishingiz mumkin.",
                    ],
                },
            ]}
        />
    );
}
