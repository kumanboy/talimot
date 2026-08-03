import type {
    GhazalTestDefinition,
} from "@/features/national-certificate/model/ghazal-test-types";

export const ghazalOneTest = {
    kind: "ghazal",

    id: "ghazal-1",
    slug: "1",

    title: "G‘azal — 1",

    description:
        "G‘azal mazmuni, baytlar tahlili, lug‘at va badiiy san’atlarga doir test.",

    topic: "gazal",

    author: "Alisher Navoiy",

    instruction:
        "G‘azalni o‘qing va quyidagi topshiriqlarni bajaring.",

    couplets: [
        {
            order: 1,
            firstLine:
                "Ko‘ngillar nolasi zulfin kamandin nogahon ko‘rgach,",
            secondLine:
                "Erur andoqki, qushlar qichqirishqaylar yilon ko‘rgach.",
        },
        {
            order: 2,
            firstLine:
                "Ko‘ngil chokini ko‘zumda ashki rangin elga fosh etdi,",
            secondLine:
                "Baliq zaxmini fahm aylurlar el daryoda qon ko‘rgach.",
        },
        {
            order: 3,
            firstLine:
                "Ko‘zum qon yosh to‘kar, netib ko‘ngil zaxmin yashuraykim,",
            secondLine:
                "Toparlar yerda zaxmin sayd qonidin nishon ko‘rgach.",
        },
        {
            order: 4,
            firstLine:
                "Bo‘yo‘lg‘on qon aro jon pardasi yetgach g‘ami hajring,",
            secondLine:
                "Ko‘ngil bog‘ida bargedurki, ol o‘lmish xazon ko‘rgach.",
        },
        {
            order: 5,
            firstLine:
                "Xadanging zaxmi ichindin bolalarni yug‘on yoshim",
            secondLine:
                "Erur tifleki, o‘lg‘ay qush bolasini oshyon ko‘rgach.",
        },
        {
            order: 6,
            firstLine:
                "Ko‘ngillar naqshini toroj etarga yopmog‘ing burqa,",
            secondLine:
                "Aningdekdurki, toz bog‘lar qaroqchi karvon ko‘rgach.",
        },
        {
            order: 7,
            firstLine:
                "Yuzin zulf ichra to ko‘rdim, o‘lib vasliga yetmasmen,",
            secondLine:
                "G‘alat ermish yuz urmoq, kecha o‘tni har qayda ko‘rgach.",
        },
        {
            order: 8,
            firstLine:
                "Erur chun olam ichra joh foniy, yaxshi ot boqiy,",
            secondLine:
                "Bas, el komiga ravo ayla, o‘zingni komron ko‘rgach.",
        },
        {
            order: 9,
            firstLine:
                "Navoiy, xurdai nazmingni andoq aylading tahrir,",
            secondLine:
                "Ki sochqay xurda boshing uzra shohi xurdadon ko‘rgach.",
        },
    ],

    vocabulary: [
        {
            term: "kamand",
            meaning: "arqon",
            marker: "1",
        },
        {
            term: "ashk",
            meaning: "ko‘z yosh",
            marker: "2",
        },
        {
            term: "sayd",
            meaning: "ov, o‘lja",
            marker: "3",
        },
        {
            term: "xadang",
            meaning: "o‘q",
            marker: "4",
        },
        {
            term: "tifl",
            meaning: "yosh bola",
            marker: "5",
        },
        {
            term: "burqa",
            meaning: "yuzga tutilgan parda",
            marker: "6",
        },
        {
            term: "joh",
            meaning: "boylik, davlat",
            marker: "7",
        },
        {
            term: "kom",
            meaning: "maqsad, orzu",
            marker: "8",
        },
        {
            term: "xurda",
            meaning: "nozik, yashirin, sir",
            marker: "9",
        },
    ],

    questionCount: 5,
    scorePerQuestion: 2.5,
    maximumScore: 12.5,

    estimatedMinutes: 20,

    access: "free",

    questions: [
        {
            id: "ghazal-1-question-1",
            order: 1,
            sourceOrder: 28,

            question:
                "G‘azal matnasi haqidagi noto‘g‘ri hukmni aniqlang.",

            score: 2.5,

            correctOptionId: "B",

            explanation: {
                audio: {
                    src: "/audio/tests/milliy-sertifikat/gazal/1/question-1.mp3",
                },
            },

            options: [
                {
                    id: "A",
                    text:
                        "Oshiqning ko‘ngli qo‘rquvda qolgan qushlarga qiyoslangan.",
                },
                {
                    id: "B",
                    text:
                        "Yor zulfining halqalari tuzoq misolidir deya tashbeh qilingan.",
                },
                {
                    id: "C",
                    text:
                        "Oshiq nolasi tuzoqdan ozod bo‘la olmayotgan qushlarga qiyoslangan.",
                },
                {
                    id: "D",
                    text:
                        "Yorning zulfi qushlarga qo‘rquv solgan ilonga qiyoslangan.",
                },
            ],
        },

        {
            id: "ghazal-1-question-2",
            order: 2,
            sourceOrder: 29,

            question:
                "2-bayt mazmunida aks etmagan fikrni aniqlang.",

            score: 2.5,

            correctOptionId: "C",

            explanation: {
                audio: {
                    src: "/audio/tests/milliy-sertifikat/gazal/1/question-2.mp3",
                },
            },

            options: [
                {
                    id: "A",
                    text:
                        "Oshiqning qonli ko‘z yoshlari daryoning suviga tashbeh qilingan.",
                },
                {
                    id: "B",
                    text:
                        "Qalb jarohati tufayli oshiqning ko‘zlaridan qonli yosh oqadi.",
                },
                {
                    id: "C",
                    text:
                        "Oshiqning ko‘ngil jarohatini ko‘z yoshlari elga ma’lum aylaydi.",
                },
                {
                    id: "D",
                    text:
                        "El daryo suviga qarab unda baliq bor yoki yo‘qligini bilib oladi.",
                },
            ],
        },

        {
            id: "ghazal-1-question-3",
            order: 3,
            sourceOrder: 30,

            question:
                "4-bayt mazmuni to‘g‘ri izohlangan javobni belgilang.",

            score: 2.5,

            correctOptionId: "A",

            explanation: {
                audio: {
                    src: "/audio/tests/milliy-sertifikat/gazal/1/question-3.mp3",
                },
            },

            options: [
                {
                    id: "A",
                    text:
                        "Ko‘ngil bog‘idagi barglar hech qachon xazon ofatiga yuz tutmaydi, shu bois oshiq qon yutsa ham hajr g‘amiga yengilmaydi.",
                },
                {
                    id: "B",
                    text:
                        "Xazon faslida bog‘dagi barglar qizg‘ish rangga kirgani kabi yor hajrida qolgan oshiqning jon pardasi qon tusiga kirdi.",
                },
                {
                    id: "C",
                    text:
                        "Ko‘ngil xazonga yuz tutgan bog‘ning barglari kabi qizg‘ish rangdadir.",
                },
                {
                    id: "D",
                    text:
                        "Jon pardasi qon rangiga bo‘yalsa, oshiq qalbi hajr g‘amiga botadi.",
                },
            ],
        },

        {
            id: "ghazal-1-question-4",
            order: 4,
            sourceOrder: 31,

            question:
                "G‘azalda quyidagi qaysi o‘xshatish mavjud emas?",

            score: 2.5,

            correctOptionId: "D",

            explanation: {
                audio: {
                    src: "/audio/tests/milliy-sertifikat/gazal/1/question-4.mp3",
                },
            },

            options: [
                {
                    id: "A",
                    text:
                        "Yor karvonni talash uchun shaylanib yuziga niqob tortgan qaroqchiga qiyos qilingan.",
                },
                {
                    id: "B",
                    text:
                        "Yorning sochlari tunga, yuzi esa shu zulmatni nurafshon etuvchi olovga qiyoslangan.",
                },
                {
                    id: "C",
                    text:
                        "Oshiqning ko‘z yoshlari qush bolalarini inidan olib sho‘xlik qiladigan bolalarga qiyoslangan.",
                },
                {
                    id: "D",
                    text:
                        "Oshiqning jarohat yetgan qalbi o‘lja ketidan borib, o‘zi yaralangan ovchiga qiyoslangan.",
                },
            ],
        },

        {
            id: "ghazal-1-question-5",
            order: 5,
            sourceOrder: 32,

            question:
                "Quyidagi qaysi fikr 8-baytda aks etmagan?",

            score: 2.5,

            correctOptionId: "B",

            explanation: {
                audio: {
                    src: "/audio/tests/milliy-sertifikat/gazal/1/question-5.mp3",
                },
            },

            options: [
                {
                    id: "A",
                    text:
                        "Baxt va davlatdan yuz o‘gir, o‘zingga bino qo‘yma.",
                },
                {
                    id: "B",
                    text:
                        "Elning murod-maqsadiga erishishi uchun xizmat qil.",
                },
                {
                    id: "C",
                    text:
                        "O‘zingdan yaxshi nom qoldirish uchun harakat qil.",
                },
                {
                    id: "D",
                    text:
                        "Bu olamda davlat o‘tkinchidir, unga ruju qo‘yma.",
                },
            ],
        },
    ],
} as const satisfies GhazalTestDefinition;