import type {
    StandardFiveTestDefinition,
} from "@/features/national-certificate/model/standard-five-test-types";

export const literaryWorksOneTest =
    {
        kind: "standard-five",

        id:
            "literary-works-1",

        slug: "1",

        topic:
            "badiiy-asarlar",

        title:
            "Badiiy asarlar — 1",

        description:
            "Adiblar, asarlar, qahramonlar va she’riy parchalar bo‘yicha 5 ta savol.",

        questionCount: 5,

        scorePerQuestion: 1.7,

        maximumScore: 8.5,

        estimatedMinutes: 12,

        access: "free",

        questions: [
            {
                id:
                    "literary-works-1-question-1",

                order: 1,

                sourceOrder: 13,

                prompt:
                    "She’riy parcha haqidagi to‘g‘ri hukmni aniqlang.",

                excerpt: [
                    "Mengiz yo ravzayi rizvonmudur bu?",
                    "Og‘iz yo g‘unchayi xandonmudur bu?",
                ],

                question:
                    "She’riy parcha haqidagi to‘g‘ri hukmni aniqlang.",

                options: [
                    {
                        id: "A",
                        text:
                            "Mutlaq va muqayyad qofiya qo‘llangan.",
                    },
                    {
                        id: "B",
                        text:
                            "r undoshi raviy vazifasini bajargan.",
                    },
                    {
                        id: "C",
                        text:
                            "Yoyiq va yig‘iq radif qo‘llangan.",
                    },
                    {
                        id: "D",
                        text:
                            "u unlisi raviy vazifasini bajargan.",
                    },
                ],

                correctOptionId: "A",

                score: 1.7,


                explanation: {

                    audio: {

                        src:

                            "/audio/tests/milliy-sertifikat/badiiy-asarlar/1/question-1.mp3",

                    },

                },
            },

            {
                id:
                    "literary-works-1-question-2",

                order: 2,

                sourceOrder: 14,

                prompt:
                    "She’riy parcha haqidagi to‘g‘ri hukmni aniqlang.",

                excerpt: [
                    "Labingdin chun suchuklik qand o‘g‘urlar,",
                    "Solurlar el ani suvga yalang‘och.",
                ],

                question:
                    "She’riy parcha haqidagi to‘g‘ri hukmni aniqlang.",

                options: [
                    {
                        id: "A",
                        text:
                            "El suvga tashbeh qilingan.",
                    },
                    {
                        id: "B",
                        text:
                            "Suv tashxis asosida tasvirlangan.",
                    },
                    {
                        id: "C",
                        text:
                            "Husni ta’lil san’ati aks etgan.",
                    },
                    {
                        id: "D",
                        text:
                            "Tardi aks san’ati aks etgan.",
                    },
                ],

                correctOptionId: "C",

                score: 1.7,


                explanation: {

                    audio: {

                        src:

                            "/audio/tests/milliy-sertifikat/badiiy-asarlar/1/question-2.mp3",

                    },

                },
            },

            {
                id:
                    "literary-works-1-question-3",

                order: 3,

                sourceOrder: 15,

                question:
                    "“Ot egasi” hikoyasining asosiy g‘oyasi qaysi javobda to‘g‘ri izohlangan?",

                options: [
                    {
                        id: "A",
                        text:
                            "Yurt sog‘inchi, Vatanga muhabbat kuylangan.",
                    },
                    {
                        id: "B",
                        text:
                            "Qadriyatlar, do‘stlik va sadoqat ulug‘langan.",
                    },
                    {
                        id: "C",
                        text:
                            "Ilm-ma’rifatga, o‘zlikni anglashga da’vat etilgan.",
                    },
                    {
                        id: "D",
                        text:
                            "Erk va ozodlik uchun kurashga da’vat etilgan.",
                    },
                ],

                correctOptionId: "B",

                score: 1.7,


                explanation: {

                    audio: {

                        src:

                            "/audio/tests/milliy-sertifikat/badiiy-asarlar/1/question-3.mp3",

                    },

                },
            },

            {
                id:
                    "literary-works-1-question-4",

                order: 4,

                sourceOrder: 16,

                question:
                    "“Kecha va kunduz” romanida quyidagi qaysi tarixiy voqea qalamga olinmagan?",

                options: [
                    {
                        id: "A",
                        text:
                            "Millat ziyolilarining qatag‘on qilinishi.",
                    },
                    {
                        id: "B",
                        text:
                            "Birinchi jahon urushi voqealari.",
                    },
                    {
                        id: "C",
                        text:
                            "Jadid ma’rifatparvarlarining faoliyati.",
                    },
                    {
                        id: "D",
                        text:
                            "Mardikorlikka safarbar qilish siyosati.",
                    },
                ],

                correctOptionId: "A",

                score: 1.7,


                explanation: {

                    audio: {

                        src:

                            "/audio/tests/milliy-sertifikat/badiiy-asarlar/1/question-4.mp3",

                    },

                },
            },

            {
                id:
                    "literary-works-1-question-5",

                order: 5,

                sourceOrder: 17,

                question:
                    "“Ikki eshik orasi” romani voqealari xato izohlangan javobni aniqlang.",

                options: [
                    {
                        id: "A",
                        text:
                            "Ikkinchi jahon urushi, front va front orti voqealari tasvirlangan.",
                    },
                    {
                        id: "B",
                        text:
                            "Toshkent ahli boshiga kulfat solgan zilzila haqida so‘z borgan.",
                    },
                    {
                        id: "C",
                        text:
                            "Mustaqillikning dastlabki yillaridagi voqealar qalamga olingan.",
                    },
                    {
                        id: "D",
                        text:
                            "Oddiy qishloq muallimining qatag‘on qilinishi haqida so‘z borgan.",
                    },
                ],

                correctOptionId: "C",

                score: 1.7,


                explanation: {

                    audio: {

                        src:

                            "/audio/tests/milliy-sertifikat/badiiy-asarlar/1/question-5.mp3",

                    },

                },
            },
        ],
    } as const satisfies
        StandardFiveTestDefinition;