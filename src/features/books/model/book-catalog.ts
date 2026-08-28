import type {
    BookDefinition,
} from "@/features/books/model/book-types";

const defaultDelivery = {
    method: "bts",
    label: "BTS pochta xizmati",
    description:
        "Buyurtma siz tanlagan eng yaqin BTS pochta punktiga yuboriladi.",
    price: 35000,
} as const;

export const books: readonly BookDefinition[] = [
    {
        id: "grammar-book",
        slug: "grammatika",
        title: "Grammatika kitobi",
        author: "Sardor Toshmuhammadov",
        shortDescription:
            "Milliy sertifikat uchun grammatika qoidalari, tushuntirishlar va mavzuli mashqlar.",
        fullDescription: [
            "Ushbu qo‘llanma Milliy sertifikat imtihoniga tayyorlanayotgan o‘quvchilar uchun grammatika mavzularini tizimli o‘rganishga yordam beradi.",
            "Kitobda imlo, morfemika, leksikologiya, morfologiya, sintaksis va uslubiyat bo‘yicha tushuntirishlar hamda amaliy topshiriqlar jamlangan.",
        ],
        badge: "TO‘LIQ QO‘LLANMA",
        coverImage: "/images/home/books/grammar-book.webp",
        coverImageAlt: "Milliy sertifikat uchun grammatika kitobi",
        imagePosition: "center 62%",
        accent: "grammar",
        pageCount: 320,
        formatLabel: "Bosma kitob",
        features: [
            "Milliy sertifikat mavzulari",
            "Tushunarli qoida va izohlar",
            "Mavzulashtirilgan mashqlar",
            "Amaliy test topshiriqlari",
        ],
        sale: {
            originalPrice: 180000,
            salePrice: 149000,
            endsAt: "2026-08-20T23:59:59+05:00",
        },
        delivery: defaultDelivery,
        stockStatus: "in-stock",
        status: "published",
    },
    {
        id: "essay-book",
        slug: "esse",
        title: "Esse bo‘yicha qo‘llanma",
        author: "Sardor Toshmuhammadov",
        shortDescription:
            "Esse tuzilishi, dalillash, misollar va baholash mezonlari bo‘yicha amaliy qo‘llanma.",
        fullDescription: [
            "Qo‘llanma Milliy sertifikat imtihonida esse yozish jarayonini sodda va tushunarli bosqichlarga ajratadi.",
            "Unda tayyor shablonlar, kirish va xulosa yozish usullari, dalillash namunalari hamda namunaviy esselar berilgan.",
        ],
        badge: "YOZMA SAVODXONLIK",
        coverImage: "/images/home/books/essay-book.webp",
        coverImageAlt: "Milliy sertifikat uchun esse bo‘yicha qo‘llanma",
        imagePosition: "center 66%",
        accent: "essay",
        pageCount: 180,
        formatLabel: "Bosma kitob",
        features: [
            "Tayyor esse shabloni",
            "Dalillash usullari",
            "Namunaviy esselar",
            "Kirish va xulosa namunalari",
        ],
        sale: {
            originalPrice: 150000,
            salePrice: 119000,
            endsAt: "2026-08-20T23:59:59+05:00",
        },
        delivery: defaultDelivery,
        stockStatus: "in-stock",
        status: "published",
    },
    {
        id: "ghazal-book",
        slug: "gazal",
        title: "G‘azal bo‘yicha qo‘llanma",
        author: "Sardor Toshmuhammadov",
        shortDescription:
            "Bayt mazmuni, mumtoz so‘zlar va she’riy san’atlarni tahlil qilish qo‘llanmasi.",
        fullDescription: [
            "Qo‘llanma g‘azal baytlarini bosqichma-bosqich tushunish, mumtoz so‘zlar ma’nosini aniqlash va mazmunni ochishga yordam beradi.",
            "Unda qofiya, radif, she’riy san’atlar va Milliy sertifikat savollarini yechish bo‘yicha amaliy tahlillar berilgan.",
        ],
        badge: "MUMTOZ ADABIYOT",
        coverImage: "/images/home/books/ghazal-book.webp",
        coverImageAlt: "Milliy sertifikat uchun g‘azal bo‘yicha qo‘llanma",
        imagePosition: "center 65%",
        accent: "ghazal",
        pageCount: 220,
        formatLabel: "Bosma kitob",
        features: [
            "Mumtoz so‘zlar lug‘ati",
            "Bayt mazmunini ochish",
            "She’riy san’atlar tahlili",
            "Qofiya va radif bo‘yicha mashqlar",
        ],
        sale: {
            originalPrice: 170000,
            salePrice: 139000,
            endsAt: "2026-08-20T23:59:59+05:00",
        },
        delivery: defaultDelivery,
        stockStatus: "in-stock",
        status: "published",
    },
];

export function getPublishedBooks(): readonly BookDefinition[] {
    return books.filter((book) => book.status === "published");
}

export function getBookBySlug(
    slug: string,
): BookDefinition | null {
    return (
        books.find(
            (book) =>
                book.slug === slug &&
                book.status === "published",
        ) ?? null
    );
}
