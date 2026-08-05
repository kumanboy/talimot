import type { Metadata } from "next";

import {
    LegalPage,
} from "@/features/legal/components/legal-page";

export const metadata: Metadata = {
    title: "Biz haqimizda | TA’LIMOT",
    description:
        "TA’LIMOT milliy sertifikatlar platformasi haqida ma’lumot.",
};

export default function AboutPage() {
    return (
        <LegalPage
            eyebrow="TA’LIMOT HAQIDA"
            title="Biz haqimizda"
            description="Milliy sertifikatga tayyorgarlikni tartibli, tushunarli va natijaga yo‘naltirilgan qilish uchun yaratilgan ta’lim platformasi."
            sections={[
                {
                    title: "Bizning maqsadimiz",
                    paragraphs: [
                        "TA’LIMOT ona tili va adabiyot fanidan Milliy sertifikatga tayyorlanayotgan o‘quvchi, abituriyent, talaba va o‘qituvchilar uchun yaratilgan.",
                        "Platformadagi testlar, yo‘l xaritasi, kurslar, kitoblar va esse tekshirish xizmatlari foydalanuvchining tayyorgarligini bir joyda davom ettirishiga yordam beradi.",
                    ],
                },
                {
                    title: "Nimalarni taklif qilamiz?",
                    items: [
                        "Mavzular bo‘yicha testlar va sinov imtihonlari",
                        "Shaxsiy tayyorgarlik yo‘l xaritasi",
                        "Ona tili va adabiyot kurslari",
                        "Milliy sertifikat uchun qo‘llanmalar",
                        "AI va ustoz yordamida esse tekshirish",
                    ],
                },
                {
                    title: "Ta’lim yondashuvimiz",
                    paragraphs: [
                        "Biz murakkab mavzularni bosqichma-bosqich tushuntirish, xatolarni tahlil qilish va foydalanuvchini muntazam mashq qilishga yo‘naltirish tamoyiliga amal qilamiz.",
                        "Platforma rivojlanib borgani sari yangi testlar, kurslar, kitoblar va o‘quv imkoniyatlari qo‘shib boriladi.",
                    ],
                },
            ]}
        />
    );
}
