import type { Metadata } from "next";

import {
    LegalPage,
} from "@/features/legal/components/legal-page";

export const metadata: Metadata = {
    title: "Foydalanish shartlari | TA’LIMOT",
    description:
        "TA’LIMOT platformasidan foydalanish shartlari.",
};

export default function TermsPage() {
    return (
        <LegalPage
            eyebrow="HUQUQIY MA’LUMOT"
            title="Foydalanish shartlari"
            description="Platformadan foydalanish orqali quyidagi asosiy shartlarga rozilik bildirasiz."
            updatedAt="Oxirgi yangilanish: 4-avgust, 2026-yil"
            sections={[
                {
                    title: "1. Umumiy qoidalar",
                    paragraphs: [
                        "TA’LIMOT ta’lim va imtihonga tayyorgarlik xizmatlarini taqdim etadi. Platformadagi materiallardan faqat shaxsiy ta’lim maqsadida foydalanish mumkin.",
                        "Foydalanuvchi platformadan qonunga zid, zararli yoki boshqa foydalanuvchilarga xalaqit beradigan maqsadlarda foydalanmasligi kerak.",
                    ],
                },
                {
                    title: "2. Hisob va ma’lumotlar",
                    paragraphs: [
                        "Foydalanuvchi kiritgan ma’lumotlarning to‘g‘riligi uchun o‘zi javob beradi. Hisobga kirish ma’lumotlarini boshqa shaxslarga bermaslik tavsiya etiladi.",
                        "Platforma xavfsizligi uchun shubhali faollik aniqlanganda ayrim imkoniyatlar vaqtincha cheklanishi mumkin.",
                    ],
                },
                {
                    title: "3. Kurslar, kitoblar va xizmatlar",
                    paragraphs: [
                        "Kurs, kitob yoki boshqa pullik xizmat narxi xarid vaqtida ko‘rsatilgan qiymat asosida belgilanadi.",
                        "To‘lov tasdiqlanishi, kursga qo‘shish, kitob yetkazib berish yoki esse tekshirish xizmatining boshlanishi tegishli xizmat shartlariga muvofiq amalga oshiriladi.",
                    ],
                },
                {
                    title: "4. Mualliflik huquqi",
                    paragraphs: [
                        "Platformadagi matnlar, testlar, darslar, rasmlar, videolar va boshqa materiallarni ruxsatsiz ko‘paytirish, sotish yoki ommaviy tarqatish mumkin emas.",
                    ],
                },
                {
                    title: "5. Xizmatdagi o‘zgarishlar",
                    paragraphs: [
                        "Platforma funksiyalari, narxlar va mazmun foydalanuvchi tajribasini yaxshilash maqsadida yangilanishi mumkin. Muhim o‘zgarishlar tegishli sahifalarda e’lon qilinadi.",
                    ],
                },
            ]}
        />
    );
}
