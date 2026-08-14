import type {
    PassageFiveTestDefinition,
} from "@/features/national-certificate/model/passage-five-test-types";

export const scientificTextOneTest =
    {
        kind: "passage-five",

        id: "scientific-text-1",
        slug: "1",

        topic: "ilmiy-matn",

        title: "Ilmiy matn — 1",

        description:
            "Merkuriy haqidagi ilmiy matn asosida tuzilgan 5 ta savol.",

        instruction:
            "Matnni o‘qing va quyidagi topshiriqlarni bajaring.",

        source:
            "Milliy sertifikat formatidagi ilmiy matn",

        passage: [
            {
                type:
                    "numbered-section",

                id:
                    "mercury-section-1",

                marker: "I",

                paragraphs: [
                    "Quyosh tizimidagi eng kichik sayyora — Merkuriy. Sayyora Rim xudosi Merkuriy nomi bilan atalgan. Merkuriyni kuzatgan birinchi astronom Galiley Galileo edi. Merkuriyning o‘ziga xos jihatlaridan biri boshqa barcha sayyoralardan kichik ekanligidir. Merkuriy atmosferasining asosiy kimyoviy elementi geliy bo‘lganligi bois u yulduz singari yorqin. Oddiy teleskop yordamida ham ushbu ajoyib sayyorani ko‘rish mumkin. Ertalab Quyosh chiqqanida yoki kechqurun Quyosh botishida esa teleskopsiz ham kuzatish mumkin. Merkuriy Quyoshga boshqa sayyoralardan ko‘ra yaqin. U Yerga nisbatan yetti barobar ko‘p Quyosh energiyasini oladi. Merkuriyning yuzasi Oy yuzasiga o‘xshaydi: ko‘p sonli kraterlar mavjud, ularning ba’zilari ancha chuqur. Astronomlar Merkuriy yadrosida temir mavjud degan taxminni ilgari surgan edilar. Keyinchalik esa Merkuriy yadrosida temirning ulushi boshqa sayyoralarga qaraganda yuqori ekanligi aniqlandi.",
                ],
            },

            {
                type:
                    "numbered-section",

                id:
                    "mercury-section-2",

                marker: "II",

                paragraphs: [
                    "Merkuriy o‘zining magnit maydoniga ega, ammo Yerdan bir necha marta kuchsizroq. Bu shuni ko‘rsatadiki, yadro suyuq bo‘lishi mumkin. Merkuriyda tabiiy yo‘ldoshlar yo‘q. Orbitada sayyora notekis harakat qiladi. Merkuriyda bo‘lish va Quyoshga qarash imkoni bo‘lganida edi, uning teskari yo‘nalishda harakat qilishini ko‘rish mumkin bo‘lar edi.",
                ],
            },

            {
                type:
                    "numbered-section",

                id:
                    "mercury-section-3",

                marker: "III",

                paragraphs: [
                    "Bu tabiiy jarayon afsonalarda Yoshaning Quyoshni to‘xtatgani voqeasi bilan izohlanadi.",
                ],
            },

            {
                type:
                    "numbered-section",

                id:
                    "mercury-section-4",

                marker: "IV",

                paragraphs: [
                    "Sayyora evolutsiyasiga Quyosh katta ta’sir ko‘rsatadi. Taxminan bir asr oldin Merkuriy sirtining yarmi muntazam issiq bo‘ladi degan faraz paydo bo‘lgan edi, chunki sayyoraning bir tomoni doimo Quyoshga qarab turadi. Ammo bu da’vo noto‘g‘ri edi. Merkuriy kuchsiz tortishish kuchiga ega. Atmosferaning siyrakligi sayyorani meteoritlar, shamollar va boshqa tabiat hodisalariga qarshi himoyasiz qiladi. Merkuriyning kometaga o‘xshash dumi bor. Uning uzunligi 2,5 million km. Merkuriy tekis mintaqasi tufayli yosh deb qaraladi. Yuqori haroratga qaramay, sayyorada suv muzlarining ulkan zaxiralari mavjud. U chuqur kraterlar va qutbli nuqtalarning pastki qismida joylashgan. Muzlar hech qachon erimaydi, chunki baland devorlar ularni Quyosh nurlaridan to‘sib turadi. Ilgari Merkuriy Veneraning yo‘ldoshi degan gipoteza mavjud edi.",
                    "Merkuriy yil davomida Quyosh atrofida 4 marta va o‘z o‘qi atrofida 6 marta aylanadi. Radiusi kichik ekanligiga qaramay, Merkuriyning massasi ulkan sayyoralardan, masalan Titan va Ganimeddan ham ortiqdir. Bu katta yadroga ega ekanligi bilan bog‘liq.",
                ],
            },
        ],

        questionCount: 5,

        scorePerQuestion: 1.7,

        maximumScore: 8.5,

        estimatedMinutes: 15,

        access: "free",

        questions: [
            {
                id:
                    "scientific-text-1-question-1",

                order: 1,

                sourceOrder: 18,

                question:
                    "Matn mazmuniga mos to‘g‘ri shakllantirilgan gapni aniqlang.",

                options: [
                    {
                        id: "A",

                        text:
                            "Merkuriy tashqi ko‘rinishi jihatidan Oyga ham, kometaga ham o‘xshaydi.",
                    },

                    {
                        id: "B",

                        text:
                            "Merkuriy Quyosh atrofida Veneraga nisbatan uzoqroq masofada aylanadi.",
                    },

                    {
                        id: "C",

                        text:
                            "Merkuriyni tadqiq etishga urinish XX asrning 20–30-yillarida boshlangan.",
                    },

                    {
                        id: "D",

                        text:
                            "Ulkan sayyoralar kabi Merkuriyning massasi ham uning hajmi bilan mutanosib.",
                    },
                ],

                correctOptionId: "A",

                score: 1.7,

                explanation: {
                    audio: {
                        src:
                            "/audio/tests/milliy-sertifikat/ilmiy-matn/1/question-1.mp3",
                    },
                },
            },

            {
                id:
                    "scientific-text-1-question-2",

                order: 2,

                sourceOrder: 19,

                question:
                    "Raqamlar bilan ko‘rsatilgan qaysi gap matnning mazmuniy tuzilishida uslubiy xatolikni yuzaga keltirgan?",

                options: [
                    {
                        id: "A",

                        text: "IV",
                    },

                    {
                        id: "B",

                        text: "II",
                    },

                    {
                        id: "C",

                        text: "I",
                    },

                    {
                        id: "D",

                        text: "III",
                    },
                ],

                correctOptionId: "C",

                score: 1.7,

                explanation: {
                    audio: {
                        src:
                            "/audio/tests/milliy-sertifikat/ilmiy-matn/1/question-2.mp3",
                    },
                },
            },

            {
                id:
                    "scientific-text-1-question-3",

                order: 3,

                sourceOrder: 20,

                question:
                    "Matn mazmunida aks etgan ma’lumotni aniqlang.",

                options: [
                    {
                        id: "A",

                        text:
                            "Merkuriy hajm jihatdan Titan va Ganimed kabi ulkan sayyoralardan ham yirik.",
                    },

                    {
                        id: "B",

                        text:
                            "Merkuriy Quyosh atrofida Yerga nisbatan kamroq muddatda aylanib chiqadi.",
                    },

                    {
                        id: "C",

                        text:
                            "Merkuriy yuzasining teng yarmi ulkan suv muzlari zaxiralari bilan qoplangan.",
                    },

                    {
                        id: "D",

                        text:
                            "Merkuriyning yadrosida temirning ulushi boshqa barcha moddalardan ko‘p.",
                    },
                ],

                correctOptionId: "B",

                score: 1.7,

                explanation: {
                    audio: {
                        src:
                            "/audio/tests/milliy-sertifikat/ilmiy-matn/1/question-3.mp3",
                    },
                },
            },

            {
                id:
                    "scientific-text-1-question-4",

                order: 4,

                sourceOrder: 21,

                question:
                    "Matn mazmuniga mos to‘g‘ri ifodalangan ma’lumotni aniqlang.",

                options: [
                    {
                        id: "A",

                        text:
                            "Merkuriy atmosferasi tarkibida boshqa kimyoviy elementlarga nisbatan geliy elementi ko‘p.",
                    },

                    {
                        id: "B",

                        text:
                            "Merkuriy sayyorasining orbitasi Quyoshga Yer orbitasiga nisbatan yetti barobar yaqin.",
                    },

                    {
                        id: "C",

                        text:
                            "Sayyora yadrosining suyuq ekanligi tortishish kuchi nisbatan kam bo‘lishiga sabab bo‘lgan.",
                    },

                    {
                        id: "D",

                        text:
                            "Atmosfera ekologiyasining yomonligi sayyorani turli tabiat hodisalaridan himoyasiz qoldiradi.",
                    },
                ],

                correctOptionId: "B",

                score: 1.7,

                explanation: {
                    audio: {
                        src:
                            "/audio/tests/milliy-sertifikat/ilmiy-matn/1/question-4.mp3",
                    },
                },
            },

            {
                id:
                    "scientific-text-1-question-5",

                order: 5,

                sourceOrder: 22,

                question:
                    "Quyidagi qaysi faraz o‘z isbotini topgan?",

                options: [
                    {
                        id: "A",

                        text:
                            "Merkuriy Veneraning yo‘ldoshi ekanligi haqidagi faraz.",
                    },

                    {
                        id: "B",

                        text:
                            "Merkuriyning yadrosida temir mavjudligi haqidagi faraz.",
                    },

                    {
                        id: "C",

                        text:
                            "Merkuriy sirtining yarmi hamisha issiq bo‘lishi haqidagi faraz.",
                    },

                    {
                        id: "D",

                        text:
                            "Merkuriyning yadrosi suyuq bo‘lishi mumkinligi haqidagi faraz.",
                    },
                ],

                correctOptionId: "B",

                score: 1.7,

                explanation: {
                    audio: {
                        src:
                            "/audio/tests/milliy-sertifikat/ilmiy-matn/1/question-5.mp3",
                    },
                },
            },
        ],
    } as const satisfies
        PassageFiveTestDefinition;