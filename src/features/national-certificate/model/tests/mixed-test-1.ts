import type {
    MixedTestDefinition,
} from "@/features/national-certificate/model/mixed-test-types";

export const mixedTestOne =
    {
        kind: "mixed",
        id: "mixed-test-1",
        slug: "1",
        topic: "aralash",
        title: "Aralash test — 1",
        description:
            "Punktuatsiya, leksikologiya, sintaksis, uslubiyat va she’riy san’atlarga doir aralash topshiriqlar.",
        instruction:
            "Har bir topshiriq shartini diqqat bilan o‘qing va javoblarni tegishli shaklda kiriting.",
        taskCount: 14,
        maximumScore: 25.3,
        estimatedMinutes: 35,
        access: "free",
        questions: [
            {
                type: "multiple-choice",
                id: "mixed-test-1-question-4",
                order: 1,
                sourceOrder: 4,
                question:
                    "O‘zaro ma’nodoshlik hosil qila oladigan so‘zlarni aniqlang.",
                visual: {
                    type: "word-diagram",
                    nodes: [
                        { id: "root-a", text: "noo‘xshash", role: "root" },
                        { id: "a-left", text: "farq", role: "leaf" },
                        { id: "a-right", text: "tafovut", role: "leaf" },
                        { id: "root-b", text: "basavlat", role: "root" },
                        { id: "b-left", text: "sumbat", role: "leaf" },
                        { id: "b-right", text: "gavda", role: "leaf" },
                        { id: "root-c", text: "turfa", role: "root" },
                        { id: "c-left", text: "g‘alati", role: "leaf" },
                        { id: "c-right", text: "ajoyib", role: "leaf" },
                        { id: "root-d", text: "qasoskor", role: "root" },
                        { id: "d-left", text: "o‘ch", role: "leaf" },
                        { id: "d-right", text: "intiqom", role: "leaf" },
                    ],
                    connections: [
                        { from: "root-a", to: "a-left" },
                        { from: "root-a", to: "a-right" },
                        { from: "root-b", to: "b-left" },
                        { from: "root-b", to: "b-right" },
                        { from: "root-c", to: "c-left" },
                        { from: "root-c", to: "c-right" },
                        { from: "root-d", to: "d-left" },
                        { from: "root-d", to: "d-right" },
                    ],
                },
                options: [
                    { id: "A", text: "noo‘xshash — farq — tafovut" },
                    { id: "B", text: "basavlat — sumbat — gavda" },
                    { id: "C", text: "turfa — g‘alati — ajoyib" },
                    { id: "D", text: "qasoskor — o‘ch — intiqom" },
                ],
                correctOptionId: "C",
                maximumScore: 1.7,
                explanation: {
                    audio: {
                        src: "/audio/tests/milliy-sertifikat/aralash/1/question-4.mp3",
                    },
                },
            },
            {
                type: "multiple-choice",
                id: "mixed-test-1-question-12",
                order: 2,
                sourceOrder: 12,
                question:
                    "Qaysi gaplarda tire o‘zaro bir xil punktuatsion qoida asosida qo‘yilgan?",
                visual: {
                    type: "numbered-statements",
                    statements: [
                        { number: 1, text: "Negadir o‘z noroziligini keskin ifodaladi: “Soni bor — sifati yo‘q”." },
                        { number: 2, text: "Biroz o‘ylanib javob berdi: “Islohotlardan maqsad — sifatli ta’lim”." },
                        { number: 3, text: "“Avvalo, Vatan muqaddas sajdagohdir”, — derdi adabiyot ustozimiz." },
                        { number: 4, text: "Insonning qattiqqo‘l ustozi — hayot, aqlli tarbiyachisi esa kitobdir." },
                        { number: 5, text: "Til, adabiyot va madaniyat — barchasi millatning borligidan dalolatdir." },
                        { number: 6, text: "Rassom inson ruhiyatini — uning qalbini o‘z ijodida aks ettiradi." },
                    ],
                },
                options: [
                    { id: "A", text: "2 va 3" },
                    { id: "B", text: "1 va 2" },
                    { id: "C", text: "5 va 6" },
                    { id: "D", text: "2 va 4" },
                ],
                correctOptionId: "D",
                maximumScore: 2.5,
                explanation: {
                    audio: {
                        src: "/audio/tests/milliy-sertifikat/aralash/1/question-12.mp3",
                    },
                },
            },
            {
                type: "matching-group",
                id: "mixed-test-1-matching-33-35",
                order: 3,
                title: "33–35-savollar",
                instruction:
                    "Gaplar va sintaktik tahlilga oid izohlarni o‘zaro to‘g‘ri moslashtiring.",
                items: [
                    {
                        id: "mixed-test-1-question-33",
                        order: 1,
                        sourceOrder: 33,
                        prompt: "Vatan! Qadrdon maskan!",
                        correctChoiceId: "A",
                        maximumScore: 1.7,
                        explanation: {
                            audio: {
                                src: "/audio/tests/milliy-sertifikat/aralash/1/question-33.mp3",
                            },
                        },
                    },
                    {
                        id: "mixed-test-1-question-34",
                        order: 2,
                        sourceOrder: 34,
                        prompt:
                            "Inson uchun o‘zi tug‘ilib ulg‘aygan tuproqdan-da qadrliroq joy bormikan?!",
                        correctChoiceId: "C",
                        maximumScore: 1.7,
                        explanation: {
                            audio: {
                                src: "/audio/tests/milliy-sertifikat/aralash/1/question-34.mp3",
                            },
                        },
                    },
                    {
                        id: "mixed-test-1-question-35",
                        order: 3,
                        sourceOrder: 35,
                        prompt:
                            "Donishmanddan so‘radilar: “Bu yorug‘ olamda halovat topmoq uchun qay go‘zal maskandan, qay ulug‘ diyardan makon tutay?” Javob ayladi: “Vatandan!”",
                        correctChoiceId: "F",
                        maximumScore: 1.7,
                        explanation: {
                            audio: {
                                src: "/audio/tests/milliy-sertifikat/aralash/1/question-35.mp3",
                            },
                        },
                    },
                ],
                choices: [
                    { id: "A", text: "atov gap" },
                    { id: "B", text: "shaxsi (egasi) umumlashgan gap" },
                    { id: "C", text: "to‘liqsiz gap" },
                    { id: "D", text: "ikki bosh bo‘lakli gap" },
                    { id: "E", text: "shaxsi (egasi) noma’lum gap" },
                    { id: "F", text: "kiritmali gap" },
                ],
            },
            {
                type: "short-answer",
                id: "mixed-test-1-question-36",
                order: 4,
                sourceOrder: 36,
                question:
                    "Ajratib ko‘rsatilgan har uchala so‘z bilan ma’nodoshlik hosil qila oluvchi so‘zni yozing.",
                examples: [
                    "tez orada",
                    "qadrdon o‘rtoqlar",
                    "ko‘ngilga tanish",
                ],
                acceptedAnswers: ["YAQIN"],
                comparison: "normalized",
                maximumScore: 1.7,
                explanation: {
                    audio: {
                        src: "/audio/tests/milliy-sertifikat/aralash/1/question-36.mp3",
                    },
                },
            },
            {
                type: "short-answer",
                id: "mixed-test-1-question-37",
                order: 5,
                sourceOrder: 37,
                question:
                    "Berilgan gapda qo‘llanilishi lozim bo‘lgan tinish belgilarining to‘g‘ri ketma-ketligini yozing.",
                context:
                    "Sa’diy Sheroziy o‘zining Bo‘ston asarida shunday yozadi Shuni unutma-ki badaxloq do‘st yovuz dushmandan xavfliroq",
                acceptedAnswers: ["IKKI NUQTA, VERGUL, TIRE, NUQTA"],
                comparison: "normalized",
                maximumScore: 2.5,
                explanation: {
                    audio: {
                        src: "/audio/tests/milliy-sertifikat/aralash/1/question-37.mp3",
                    },
                },
            },
            {
                type: "short-answer",
                id: "mixed-test-1-question-38",
                order: 6,
                sourceOrder: 38,
                question:
                    "Gapda qaysi qo‘shimchaning qo‘llanishi bilan bog‘liq uslubiy xatolik kuzatilgan?",
                context:
                    "Ma’naviyat — insonni ruhan poklanishga chorlaydigan, odamning ichki dunyosini boyitadigan, irodasini baquvvat, iymon-e’tiqodini butun qiladigan, vijdonini uyg‘otadigan, qalban ulg‘ayadigan beqiyos kuchdir.",
                acceptedAnswers: ["-GAN QO‘SHIMCHASI"],
                comparison: "normalized",
                maximumScore: 1.7,
                explanation: {
                    audio: {
                        src: "/audio/tests/milliy-sertifikat/aralash/1/question-38.mp3",
                    },
                },
            },
            {
                type: "short-answer",
                id: "mixed-test-1-question-39",
                order: 7,
                sourceOrder: 39,
                question:
                    "Gapni sintaktik tahlil qiling va qaysi gap bo‘lagi uyushganini yozing.",
                context:
                    "Ota-bobolarimiz necha asrlar mobaynida shu bepoyon mintaqada qanday hamjihat bo‘lib, qanday qadriyatlar asosida yashab kelgan bo‘lsa, bugun ham, ta’bir joiz bo‘lsa, hayotning o‘zi bizni — butun O‘rta Osiyo xalqlarini — aynan ana shunday hamkorlik ruhida hayot kechirishga da’vat etmoqda.",
                acceptedAnswers: ["HOL BO‘LAGI"],
                comparison: "keywords",
                requiredKeywords: ["HOL"],
                maximumScore: 1.7,
                explanation: {
                    audio: {
                        src: "/audio/tests/milliy-sertifikat/aralash/1/question-39.mp3",
                    },
                },
            },
            {
                type: "multipart",
                id: "mixed-test-1-question-40",
                order: 8,
                sourceOrder: 40,
                question:
                    "Gapdagi so‘zlarning mazmun va grammatik jihatdan bog‘lanishini tahlil qiling.",
                context:
                    "Chinakam ma’naviyatli va ma’rifatli inson deyilganda biz inson qadrini biladigan, milliy o‘zligini anglay oladigan, erkin va ozod jamiyatni qurish uchun, mustaqil davlatimizning jahon hamjamiyatida o‘ziga munosib o‘rin egallashi uchun fidoyilik bilan kurasha oladigan insonni tushunamiz.",
                explanation: {
                    audio: {
                        src: "/audio/tests/milliy-sertifikat/aralash/1/question-40.mp3",
                    },
                },
                parts: [
                    {
                        id: "a",
                        label: "a",
                        question:
                            "Gapda ajratib ko‘rsatilgan so‘z tobelanib bog‘langan so‘zni yozing.",
                        acceptedAnswers: ["INSONNI"],
                        comparison: "normalized",
                        score: 1.2,
                    },
                    {
                        id: "b",
                        label: "b",
                        question:
                            "Gapda ajratib ko‘rsatilgan so‘z bilan teng munosabatda bog‘langan so‘zni yozing.",
                        acceptedAnswers: ["MA’RIFATLI"],
                        comparison: "normalized",
                        score: 1.3,
                    },
                ],
                maximumScore: 2.5,
            },
            {
                type: "multipart",
                id: "mixed-test-1-question-41",
                order: 9,
                sourceOrder: 41,
                question:
                    "Berilgan gaplarni grammatik jihatdan to‘g‘ri bog‘lang.",
                context:
                    "1. Yaxshi ustoz ham hikmatli kitob singaridir.\n2. Har ikkisi inson ruhini tarbiyalaydi.",
                explanation: {
                    audio: {
                        src: "/audio/tests/milliy-sertifikat/aralash/1/question-41.mp3",
                    },
                },
                parts: [
                    {
                        id: "a",
                        label: "a",
                        question:
                            "Birinchi va ikkinchi gapni qanday grammatik vosita yordamida to‘g‘ri bog‘lash mumkin?",
                        acceptedAnswers: ["CHUNKI"],
                        comparison: "normalized",
                        score: 0.8,
                    },
                    {
                        id: "b",
                        label: "b",
                        question:
                            "Natijada qo‘shma gapning qaysi turi hosil bo‘ladi?",
                        acceptedAnswers: ["ERGASHGAN QO‘SHMA GAP"],
                        comparison: "normalized",
                        score: 0.9,
                    },
                ],
                maximumScore: 1.7,
            },
            {
                type: "multipart",
                id: "mixed-test-1-question-42",
                order: 10,
                sourceOrder: 42,
                question:
                    "She’riy parchadagi ajratib ko‘rsatilgan so‘z yordamida ifodalangan she’riy san’atlarni aniqlang va yozing.",
                context:
                    "Solib borma meni, ey Yusuf husn,\nBukun Ya’qubek bayt ul-hazanda.",
                explanation: {
                    audio: {
                        src: "/audio/tests/milliy-sertifikat/aralash/1/question-42.mp3",
                    },
                },
                parts: [
                    {
                        id: "a",
                        label: "a",
                        question: "Birinchi she’riy san’atni yozing.",
                        acceptedAnswers: ["TALMEH"],
                        comparison: "normalized",
                        score: 0.8,
                    },
                    {
                        id: "b",
                        label: "b",
                        question: "Ikkinchi she’riy san’atni yozing.",
                        acceptedAnswers: ["TASHBEH"],
                        comparison: "normalized",
                        score: 0.9,
                    },
                ],
                maximumScore: 1.7,
            },
            {
                type: "multipart",
                id: "mixed-test-1-question-43",
                order: 11,
                sourceOrder: 43,
                question:
                    "She’riy parchaning qofiyasini tahlil qiling va yozing.",
                context:
                    "Kimki falak sori otar toshini,\nTosh ila ozurda etar boshini.",
                explanation: {
                    audio: {
                        src: "/audio/tests/milliy-sertifikat/aralash/1/question-43.mp3",
                    },
                },
                parts: [
                    {
                        id: "a",
                        label: "a",
                        question:
                            "Ajratib ko‘rsatilgan qofiyadosh so‘zlardagi raviyni yozing.",
                        acceptedAnswers: ["SH"],
                        comparison: "normalized",
                        score: 0.8,
                    },
                    {
                        id: "b",
                        label: "b",
                        question:
                            "Ajratib ko‘rsatilgan so‘zlar raviyning o‘rniga ko‘ra qofiyaning qaysi turini hosil qilgan?",
                        acceptedAnswers: ["MUQAYYAD QOFIYA"],
                        comparison: "normalized",
                        score: 0.9,
                    },
                ],
                maximumScore: 1.7,
            },
            {
                type: "multipart",
                id: "mixed-test-1-question-44",
                order: 12,
                sourceOrder: 44,
                question:
                    "Quyidagi qit’a mazmunini tahlil qiling va savollarga javob yozing.",
                context:
                    "Debon bergan kishi erdur, va lekin\nDemay berganga erlik bil musallam.\nNe deb, ne bersa bilg‘il ani xotun,\nDebon bermasni xotundin dog‘i kam.",
                explanation: {
                    audio: {
                        src: "/audio/tests/milliy-sertifikat/aralash/1/question-44.mp3",
                    },
                },
                parts: [
                    {
                        id: "a",
                        label: "a",
                        question: "Qit’ada qanday illat qoralangan?",
                        acceptedAnswers: ["VA’DABOZLIK"],
                        comparison: "keywords",
                        requiredKeywords: ["VA’DABOZLIK"],
                        score: 0.8,
                    },
                    {
                        id: "b",
                        label: "b",
                        question: "Qit’ada qanday fazilat ulug‘langan?",
                        acceptedAnswers: [],
                        comparison: "manual-review",
                        score: 0,
                    },
                ],
                maximumScore: 0.8,
            },
        ],
    } as const satisfies MixedTestDefinition;