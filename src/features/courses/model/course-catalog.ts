import type {
    CourseDefinition,
} from "@/features/courses/model/course-types";

const instructor = {
    name: "Sardor Toshmuhammadov",
    role: "Ona tili va adabiyot fani o‘qituvchisi",
    biography:
        "Sardor Toshmuhammadov Milliy sertifikat imtihoniga tayyorlov, grammatika, esse va matn tahlili yo‘nalishlarida dars beradi. Kurslarda nazariya, amaliy tahlil va imtihon strategiyasi birgalikda olib boriladi.",
} as const;

const unlimitedBenefits = [
    "Foydalanish muddati cheklanmagan",
    "Yopiq Telegram kanaliga kirish",
    "Video va audio darslar",
    "Qo‘shimcha materiallar",
] as const;

export const courses: readonly CourseDefinition[] = [
    {
        id: "national-certificate-course",
        slug: "milliy-sertifikat",
        title: "Milliy sertifikat kursi",
        shortDescription:
            "Grammatika, esse, g‘azal, badiiy matn va ilmiy matn bo‘yicha kompleks tayyorgarlik.",
        fullDescription: [
            "Ushbu Milliy sertifikat kursi Sardor Toshmuhammadov tomonidan haftada 4 kun jonli tarzda o‘tiladi.",
            "Kurs davomida grammatika, esse, g‘azal, badiiy matn va ilmiy matn mavzulari tizimli ravishda o‘rgatiladi. Har bir darsdan so‘ng yozib olingan video va audio materiallar yopiq Telegram kanalida taqdim etiladi.",
        ],
        badge: "ENG TO‘LIQ KURS",
        coverImage: "/images/home/course-promotion.webp",
        coverImageAlt:
            "Sardor Toshmuhammadovning Milliy sertifikat kursi",
        accent: "primary",
        instructor,
        format: "Haftada 4 kun jonli dars va yozib olingan materiallar",
        schedule:
            "Jonli darslar haftada 4 kun o‘tiladi. Aniq kun va vaqt yopiq Telegram guruhida e’lon qilinadi.",
        accessDescription:
            "To‘lov tasdiqlangach, administrator sizni kursning yopiq Telegram kanali yoki guruhiga qo‘shadi.",
        accessDurationLabel: "Cheklanmagan foydalanish",
        benefits: [
            ...unlimitedBenefits,
            "Haftada 4 kun jonli dars",
            "Har bir jonli darsning yozuvi",
        ],
        modules: [
            {
                id: "grammar",
                title: "Grammatika",
                description:
                    "Milliy sertifikat uchun asosiy grammatik mavzular.",
                lessons: [
                    { id: "spelling", title: "Imlo", type: "live" },
                    { id: "morphemics", title: "Morfemika", type: "live" },
                    { id: "morphology", title: "Morfologiya", type: "live" },
                    { id: "syntax", title: "Sintaksis", type: "live" },
                ],
            },
            {
                id: "essay",
                title: "Esse yozish",
                description:
                    "Tuzilma, dalillash, misol va xulosa ustida ishlash.",
                lessons: [
                    { id: "essay-structure", title: "Esse tuzilishi", type: "video" },
                    { id: "essay-argument", title: "Dalillash va misollar", type: "live" },
                    { id: "essay-template", title: "Esse shabloni", type: "material" },
                ],
            },
            {
                id: "analysis",
                title: "G‘azal va matn tahlili",
                description:
                    "G‘azal, badiiy matn va ilmiy matn savollarini tahlil qilish.",
                lessons: [
                    { id: "ghazal", title: "G‘azal tahlili", type: "live" },
                    { id: "literary", title: "Badiiy matn tahlili", type: "live" },
                    { id: "scientific", title: "Ilmiy matn tahlili", type: "live" },
                ],
            },
        ],
        sale: {
            originalPrice: 700000,
            salePrice: 500000,
            endsAt: "2026-08-10T23:59:59+05:00",
        },
        status: "published",
    },
    {
        id: "essay-course",
        slug: "esse",
        title: "Esse yozish kursi",
        shortDescription:
            "Esse tuzilishi, dalillash va tayyor shablon asosida kuchli esse yozishni o‘rganing.",
        fullDescription: [
            "Esse yozish kursini sotib olish orqali siz yopiq Telegram kanaliga qo‘shilasiz va yozib olingan video darslarni ko‘rasiz.",
            "Kursda esse yozish bo‘yicha tayyor shablon, fikrni rivojlantirish usullari, dalillash va namunaviy esselar beriladi. Dars Sardor Toshmuhammadov tomonidan o‘tilgan.",
        ],
        badge: "ESSE SHABLONI BILAN",
        coverImage: "/images/home/courses/essay-course.webp",
        coverImageAlt: "Milliy sertifikat uchun esse yozish kursi",
        accent: "orange",
        instructor,
        format: "Yozib olingan video darslar va tayyor materiallar",
        schedule:
            "Darslarni yopiq Telegram kanalida o‘zingizga qulay vaqtda tomosha qilasiz.",
        accessDescription:
            "To‘lov tasdiqlangach, administrator sizni esse kursining yopiq Telegram kanaliga qo‘shadi.",
        accessDurationLabel: "Cheklanmagan foydalanish",
        benefits: [
            ...unlimitedBenefits,
            "Esse yozish shabloni",
            "Namunaviy esselar",
        ],
        modules: [
            {
                id: "foundation",
                title: "Esse poydevori",
                lessons: [
                    { id: "structure", title: "Esse tuzilishi", type: "video" },
                    { id: "introduction", title: "Kirish qismini yozish", type: "video" },
                    { id: "body", title: "Asosiy qismni rivojlantirish", type: "video" },
                ],
            },
            {
                id: "argument",
                title: "Dalillash va xulosa",
                lessons: [
                    { id: "evidence", title: "Dalil va misollar", type: "video" },
                    { id: "conclusion", title: "Kuchli xulosa yozish", type: "video" },
                    { id: "template", title: "Esse shabloni", type: "material" },
                ],
            },
        ],
        sale: {
            originalPrice: 300000,
            salePrice: 199000,
            endsAt: "2026-08-10T23:59:59+05:00",
        },
        status: "published",
    },
    {
        id: "grammar-course",
        slug: "grammatika",
        title: "Grammatika kursi",
        shortDescription:
            "Imlo, morfemika, leksikologiya, morfologiya va sintaksisni tizimli o‘rganing.",
        fullDescription: [
            "Grammatika kursida Milliy sertifikat imtihonida uchraydigan asosiy grammatik mavzular bosqichma-bosqich o‘rgatiladi.",
            "Har bir modul video va audio darslar, mavzulashtirilgan mashqlar hamda ustoz izohlari bilan yopiq Telegram kanalida taqdim etiladi.",
        ],
        badge: "ENG OMMABOP",
        coverImage: "/images/home/courses/grammar-course.webp",
        coverImageAlt: "Ona tili grammatika kursi",
        accent: "primary",
        instructor,
        format: "Yozib olingan video va audio darslar",
        schedule:
            "Darslarni yopiq Telegram kanalida o‘zingizga qulay vaqtda o‘rganasiz.",
        accessDescription:
            "To‘lov tasdiqlangach, administrator sizni grammatika kursining yopiq Telegram kanaliga qo‘shadi.",
        accessDurationLabel: "Cheklanmagan foydalanish",
        benefits: unlimitedBenefits,
        modules: [
            {
                id: "core-grammar",
                title: "Asosiy grammatika",
                lessons: [
                    { id: "spelling", title: "Imlo", type: "video" },
                    { id: "morphemics", title: "Morfemika", type: "video" },
                    { id: "lexicology", title: "Leksikologiya", type: "video" },
                    { id: "morphology", title: "Morfologiya", type: "video" },
                ],
            },
            {
                id: "advanced-grammar",
                title: "Yuqori bosqich",
                lessons: [
                    { id: "syntax", title: "Sintaksis", type: "video" },
                    { id: "punctuation", title: "Punktuatsiya", type: "video" },
                    { id: "stylistics", title: "Uslubiyat", type: "audio" },
                    { id: "analysis", title: "Test tahlillari", type: "video" },
                ],
            },
        ],
        sale: {
            originalPrice: 450000,
            salePrice: 299000,
            endsAt: "2026-08-10T23:59:59+05:00",
        },
        status: "published",
    },
    {
        id: "text-analysis-course",
        slug: "matn-tahlili",
        title: "G‘azal va matn tahlillari",
        shortDescription:
            "G‘azal, badiiy matn va ilmiy matn savollarini tahlil qilish strategiyalarini o‘rganing.",
        fullDescription: [
            "Kursda g‘azal baytlarini tushunish, mumtoz so‘zlar ma’nosini aniqlash, she’riy san’atlarni topish hamda badiiy va ilmiy matnlarni tahlil qilish o‘rgatiladi.",
            "Video va audio darslar, amaliy savollar va batafsil tahlillar yopiq Telegram kanalida taqdim etiladi.",
        ],
        badge: "TAVSIYA ETILADI",
        coverImage: "/images/home/courses/text-analysis-course.webp",
        coverImageAlt: "G‘azal, badiiy va ilmiy matn tahlili kursi",
        accent: "violet",
        instructor,
        format: "Yozib olingan tahliliy video va audio darslar",
        schedule:
            "Darslarni yopiq Telegram kanalida o‘zingizga qulay vaqtda tomosha qilasiz.",
        accessDescription:
            "To‘lov tasdiqlangach, administrator sizni tahlil kursining yopiq Telegram kanaliga qo‘shadi.",
        accessDurationLabel: "Cheklanmagan foydalanish",
        benefits: [
            ...unlimitedBenefits,
            "Amaliy savol tahlillari",
        ],
        modules: [
            {
                id: "ghazal-analysis",
                title: "G‘azal tahlili",
                lessons: [
                    { id: "vocabulary", title: "Mumtoz so‘zlar lug‘ati", type: "video" },
                    { id: "meaning", title: "Bayt mazmunini ochish", type: "video" },
                    { id: "arts", title: "She’riy san’atlar", type: "video" },
                    { id: "rhyme", title: "Qofiya va radif", type: "audio" },
                ],
            },
            {
                id: "text-analysis",
                title: "Matn tahlili",
                lessons: [
                    { id: "literary", title: "Badiiy matn tahlili", type: "video" },
                    { id: "scientific", title: "Ilmiy matn tahlili", type: "video" },
                    { id: "strategy", title: "Savol yechish strategiyasi", type: "material" },
                ],
            },
        ],
        sale: {
            originalPrice: 350000,
            salePrice: 229000,
            endsAt: "2026-08-10T23:59:59+05:00",
        },
        status: "published",
    },
];

export function getPublishedCourses(): readonly CourseDefinition[] {
    return courses.filter(
        (course) => course.status === "published",
    );
}

export function getCourseBySlug(
    slug: string,
): CourseDefinition | null {
    return (
        courses.find(
            (course) =>
                course.slug === slug &&
                course.status === "published",
        ) ?? null
    );
}
