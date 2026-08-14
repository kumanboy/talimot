import type {
    DiagnosticMultipleChoiceQuestion,
    DiagnosticPassageBlock,
    DiagnosticQuestion,
    DiagnosticTestDefinition,
} from "@/features/national-certificate/model/diagnostic-test-types";

import {
    ghazalOneTest,
} from "@/features/national-certificate/model/tests/ghazal-1";

import {
    literaryTextOneTest,
} from "@/features/national-certificate/model/tests/literary-text-1";

import {
    literaryWorksOneTest,
} from "@/features/national-certificate/model/tests/literary-works-1";

import {
    mixedTestOne,
} from "@/features/national-certificate/model/tests/mixed-test-1";

import {
    scientificTextOneTest,
} from "@/features/national-certificate/model/tests/scientific-text-1";

function mapChoiceQuestion(
    question: {
        readonly id: string;
        readonly sourceOrder?: number;
        readonly order: number;
        readonly question: string;
        readonly options: readonly {
            readonly id: "A" | "B" | "C" | "D";
            readonly text: string;
        }[];
        readonly correctOptionId:
            "A" | "B" | "C" | "D";
        readonly score?: number;
        readonly maximumScore?: number;
    },
    section:
    DiagnosticMultipleChoiceQuestion["section"],
): DiagnosticMultipleChoiceQuestion {
    return {
        type: "multiple-choice",
        id:
            `diagnostic-1-question-${question.sourceOrder ?? question.order}`,
        order:
            question.sourceOrder ??
            question.order,
        section,
        question:
        question.question,
        options:
        question.options,
        correctOptionId:
        question.correctOptionId,
        maximumScore:
            question.maximumScore ??
            question.score ??
            0,
    };
}

const scientificPassage:
    readonly DiagnosticPassageBlock[] =
    scientificTextOneTest.passage.map(
        (
            block,
            index,
        ) => ({
            id:
                `diagnostic-scientific-${index + 1}`,
            type:
                "numbered-paragraph",
            marker:
            block.marker,
            text:
                block.paragraphs.join(
                    "\n\n",
                ),
        }),
    );

const literaryPassage:
    readonly DiagnosticPassageBlock[] =
    literaryTextOneTest.passage.map(
        (
            block,
            index,
        ) => {
            if (
                block.type ===
                "dialogue"
            ) {
                return {
                    id:
                        `diagnostic-literary-${index + 1}`,
                    type:
                        "dialogue",
                    marker:
                        "marker" in block
                            ? block.marker
                            : undefined,
                    text:
                        `${block.speaker}: ${block.text}`,
                };
            }

            return {
                id:
                    `diagnostic-literary-${index + 1}`,
                type:
                    block.type ===
                    "heading"
                        ? "heading"
                        : "paragraph",
                text:
                block.text,
            };
        },
    );

const ghazalPassage:
    readonly DiagnosticPassageBlock[] =
    [
        {
            id:
                "diagnostic-ghazal-heading",
            type:
                "heading",
            text:
            ghazalOneTest.author,
        },

        ...ghazalOneTest.couplets.map(
            (
                couplet,
            ) => ({
                id:
                    `diagnostic-ghazal-couplet-${couplet.order}`,
                type:
                    "poetry" as const,
                marker:
                    String(
                        couplet.order,
                    ),
                text:
                    `${couplet.firstLine}\n${couplet.secondLine}`,
            }),
        ),

        {
            id:
                "diagnostic-ghazal-vocabulary",
            type:
                "paragraph",
            text:
                `LUG‘AT: ${ghazalOneTest.vocabulary
                    .map(
                        (
                            item,
                        ) =>
                            `${item.term} — ${item.meaning}`,
                    )
                    .join("; ")}.`,
        },
    ];

const mixedBySourceOrder =
    new Map<
        number,
        (
            typeof mixedTestOne.questions
            )[number]
    >();

for (
    const question of
    mixedTestOne.questions
    ) {
    if (
        question.type ===
        "matching-group"
    ) {
        continue;
    }

    mixedBySourceOrder.set(
        question.sourceOrder,
        question,
    );
}

const mixedQuestion4 =
    mixedBySourceOrder.get(
        4,
    );

const mixedQuestion12 =
    mixedBySourceOrder.get(
        12,
    );

const mixedMatching =
    mixedTestOne.questions.find(
        (
            question,
        ) =>
            question.type ===
            "matching-group",
    );

const mixedWrittenQuestions =
    mixedTestOne.questions.filter(
        (
            question,
        ) =>
            question.type ===
            "short-answer" ||
            question.type ===
            "multipart",
    );

if (
    !mixedQuestion4 ||
    mixedQuestion4.type !==
    "multiple-choice" ||
    !mixedQuestion12 ||
    mixedQuestion12.type !==
    "multiple-choice" ||
    !mixedMatching ||
    mixedMatching.type !==
    "matching-group"
) {
    throw new Error(
        "Diagnostic test source questions are incomplete.",
    );
}

const rawQuestions:
    readonly DiagnosticQuestion[] =
    [
        {
            type:
                "multiple-choice",
            id:
                "diagnostic-1-question-1",
            order: 1,
            section:
                "grammar",
            question:
                "Imlo jihatdan to‘g‘ri yozilgan so‘zlar qatorini aniqlang.",
            options: [
                {
                    id: "A",
                    text:
                        "taassuf, murojaatnoma, tabiiy",
                },
                {
                    id: "B",
                    text:
                        "tanazzul, muassasa, ma’dad",
                },
                {
                    id: "C",
                    text:
                        "muvoviq, taassurot, taalluqli",
                },
                {
                    id: "D",
                    text:
                        "maishiy, tafovut, tafakkur",
                },
            ],
            correctOptionId:
                "D",
            maximumScore:
                1.1,
        },

        {
            type:
                "multiple-choice",
            id:
                "diagnostic-1-question-2",
            order: 2,
            section:
                "grammar",
            question:
                "Imlo jihatdan to‘g‘ri yozilgan so‘zlar qatorini aniqlang.",
            options: [
                {
                    id: "A",
                    text:
                        "o‘zidan-o‘zi, voy-voy, baxt-u saodat",
                },
                {
                    id: "B",
                    text:
                        "o‘z-o‘zidan, voy-voylamoq, hol-ahvol",
                },
                {
                    id: "C",
                    text:
                        "o‘z-o‘zicha, voy-voyiga, baxt-saodatli",
                },
                {
                    id: "D",
                    text:
                        "o‘z-o‘zligicha, voyvoyak, tarjimayi-hol",
                },
            ],
            correctOptionId:
                "B",
            maximumScore:
                1.1,
        },

        {
            type:
                "multiple-choice",
            id:
                "diagnostic-1-question-3",
            order: 3,
            section:
                "grammar",
            question:
                "Qaysi gapda ochiq so‘zi o‘z ma’nosida qo‘llangan?",
            options: [
                {
                    id: "A",
                    text:
                        "Nafisa o‘z fikrlarini ko‘pchilik oldida ham ochiq ifoda qila olardi.",
                },
                {
                    id: "B",
                    text:
                        "Yig‘ilishda aytilgan anchagina muammolar ochiq qoldi.",
                },
                {
                    id: "C",
                    text:
                        "Haftaning dushanba kuni ochiq eshiklar kuni deb e’lon qilindi.",
                },
                {
                    id: "D",
                    text:
                        "Ismat ota ochiq derazadan boshini chiqarib, o‘g‘lini chaqirdi.",
                },
            ],
            correctOptionId:
                "D",
            maximumScore:
                1.1,
        },

        {
            ...mapChoiceQuestion(
                mixedQuestion4,
                "grammar",
            ),
            id:
                "diagnostic-1-question-4",
            order: 4,
            image: {
                src:
                    "/images/diagnostika/diagnostic-1-question-4.png",
                alt:
                    "4-savoldagi o‘zaro ma’nodoshlik diagrammasi",
                width: 270,
                height: 329,
            },
            visual:
            mixedQuestion4.visual,
        },

        {
            type:
                "multiple-choice",
            id:
                "diagnostic-1-question-5",
            order: 5,
            section:
                "grammar",
            question:
                "Qaysi gapda qo‘shimcha qo‘llanishi bilan bog‘liq uslubiy xatolik mavjud emas?",
            options: [
                {
                    id: "A",
                    text:
                        "Iqtisodiy islohotlarning sersamaradorligini ta’minlash uchun ishlar olib borilmoqda.",
                },
                {
                    id: "B",
                    text:
                        "So‘zlarimizning ma’noviy bo‘yoqdorligi nutqimiz jozibasini yanada oshiradi.",
                },
                {
                    id: "C",
                    text:
                        "Qadriyatlarimizga nopisandchilik bilan munosabatda bo‘lish milliy fojiamizdir.",
                },
                {
                    id: "D",
                    text:
                        "Olimlarimiz havola etayotgan ushbu loyiha yashash sifatini oshirishga qaratilgan.",
                },
            ],
            correctOptionId:
                "D",
            maximumScore:
                1.1,
        },

        {
            type:
                "multiple-choice",
            id:
                "diagnostic-1-question-6",
            order: 6,
            section:
                "grammar",
            question:
                "Qaysi gapda g‘urur so‘zi «kibr» ma’nosida qo‘llangan?",
            options: [
                {
                    id: "A",
                    text:
                        "Gapingizni qarang, bunchalik g‘ururga berilmang, g‘urur g‘urbatga solar.",
                },
                {
                    id: "B",
                    text:
                        "Do‘ppi — o‘zbek xalqining milliy iftixori va milliy g‘ururi hisoblanadi.",
                },
                {
                    id: "C",
                    text:
                        "G‘ofur aka yuragi g‘ururga to‘la chin inson va otashnafas shoir edi.",
                },
                {
                    id: "D",
                    text:
                        "Uning yigitlik g‘ururi yordam so‘rab borishga yo‘l qo‘ymadi.",
                },
            ],
            correctOptionId:
                "A",
            maximumScore:
                1.1,
        },

        {
            type:
                "multiple-choice",
            id:
                "diagnostic-1-question-7",
            order: 7,
            section:
                "grammar",
            question:
                "Qaysi gapda nuqtalar o‘rnida so‘z yasovchi, lug‘aviy shakl yasovchi va sintaktik shakl yasovchi qo‘shimcha qo‘llanadi?",
            options: [
                {
                    id: "A",
                    text:
                        "Vatan ravnaq... yo‘lida xizmat qil... barchamizning sharafli burchimiz...",
                },
                {
                    id: "B",
                    text:
                        "Ta’lim tiz...ining barcha bo‘g‘in...i o‘zaro hamjihatlik bilan ishla...i kerak.",
                },
                {
                    id: "C",
                    text:
                        "Boy...ing bo‘lma... ham, do‘stlaring ko‘p bo‘lsin, ular kulfatda madad... bo‘lishadi.",
                },
                {
                    id: "D",
                    text:
                        "Sohada sifat ko‘rsat...larining o‘sib bora...i ijobiy o‘zgarishlardan dalolat ber...",
                },
            ],
            correctOptionId:
                "B",
            maximumScore:
                1.7,
        },

        {
            type:
                "multiple-choice",
            id:
                "diagnostic-1-question-8",
            order: 8,
            section:
                "grammar",
            question:
                "Har uchala parchada ham ishtirok etgan fe’l shakllarini aniqlang.",
            context:
                "I. Yomon holga tushganning shod et dilin,\nUnutma, yomon kun kelib qolmasin.\n\nII. Shirin so‘zli shilqay g‘anim po‘stini,\nDag‘al so‘zli dushman qilur do‘stini.\n\nIII. Shirin so‘zni o‘rgan mudom Sa’diydan,\nDag‘al so‘zli odam o‘tar g‘am bilan.\n\n1) buyruq maylidagi fe’l; 2) qo‘shma fe’l; 3) ko‘makchi fe’lli so‘z qo‘shilmasi; 4) sifatdosh; 5) III shaxs birlikdagi fe’l; 6) sof fe’l",
            options: [
                {
                    id: "A",
                    text:
                        "1 va 5",
                },
                {
                    id: "B",
                    text:
                        "3 va 4",
                },
                {
                    id: "C",
                    text:
                        "2 va 6",
                },
                {
                    id: "D",
                    text:
                        "5 va 6",
                },
            ],
            correctOptionId:
                "D",
            maximumScore:
                2.5,
        },

        {
            type:
                "multiple-choice",
            id:
                "diagnostic-1-question-9",
            order: 9,
            section:
                "grammar",
            question:
                "Berilgan gapda ishtirok etgan ko‘makchi qanday mazmuniy munosabat ifodalagan?",
            context:
                "Buyuk bobolarimizning ma’naviy merosi xususida so‘z yuritganimizda Alisher Navoiyning “Xamsa” asarini alohida tilga olamiz.",
            options: [
                {
                    id: "A",
                    text:
                        "vosita ma’nosini",
                },
                {
                    id: "B",
                    text:
                        "fikr mavzusi ma’nosini",
                },
                {
                    id: "C",
                    text:
                        "tarz, holat ma’nosini",
                },
                {
                    id: "D",
                    text:
                        "yo‘nalish ma’nosini",
                },
            ],
            correctOptionId:
                "B",
            maximumScore:
                1.7,
        },

        {
            type:
                "multiple-choice",
            id:
                "diagnostic-1-question-10",
            order: 10,
            section:
                "grammar",
            question:
                "Berilgan gap haqidagi to‘g‘ri fikrni aniqlang.",
            context:
                "Xalqimizning asrlar davomida shakllangan qadimiy madaniyati va qadriyatlarini asrab qolishimiz uchun yosh avlodni milliy ruhda tarbiya qilishimiz lozim.",
            options: [
                {
                    id: "A",
                    text:
                        "Ravish holi ot kesimga to‘g‘ridan to‘g‘ri tobelangan.",
                },
                {
                    id: "B",
                    text:
                        "Payt holi fe’l kesimga to‘g‘ridan to‘g‘ri tobelangan.",
                },
                {
                    id: "C",
                    text:
                        "Maqsad holi vositasiz to‘ldiruvchiga tobelangan.",
                },
                {
                    id: "D",
                    text:
                        "To‘ldiruvchi aniqlovchiga kelishik yordamida tobelangan.",
                },
            ],
            correctOptionId:
                "C",
            maximumScore:
                1.7,
        },

        {
            type:
                "multiple-choice",
            id:
                "diagnostic-1-question-11",
            order: 11,
            section:
                "grammar",
            question:
                "Gapdagi so‘zlarning mazmun va grammatik jihatdan bog‘lanishi to‘g‘ri ko‘rsatilgan javobni aniqlang.",
            context:
                "Bizning qadimiy va go‘zal diyorimiz nafaqat Sharq, balki jahon sivilizatsiyasi beshiklaridan biri ekanligi, o‘ylaymanki, bugun keng jamoatchilik uchun sir emas.",
            options: [
                {
                    id: "A",
                    text:
                        "qadimiy Sharq, go‘zal diyor",
                },
                {
                    id: "B",
                    text:
                        "qadimiy va go‘zal, bugun sir emas",
                },
                {
                    id: "C",
                    text:
                        "beshiklaridan ekanligi, nafaqat Sharq",
                },
                {
                    id: "D",
                    text:
                        "bizning Sharq, keng jamoatchilik",
                },
            ],
            correctOptionId:
                "B",
            maximumScore:
                1.7,
        },

        {
            ...mapChoiceQuestion(
                mixedQuestion12,
                "grammar",
            ),
            id:
                "diagnostic-1-question-12",
            order: 12,
            image: {
                src:
                    "/images/diagnostika/diagnostic-1-question-12.png",
                alt:
                    "12-savoldagi tire qo‘llanishiga oid raqamlangan gaplar",
                width: 582,
                height: 267,
            },
            visual:
            mixedQuestion12.visual,
        },

        ...literaryWorksOneTest.questions.map(
            (
                question,
            ) => ({
                ...mapChoiceQuestion(
                    question,
                    "literature",
                ),
                id:
                    `diagnostic-1-question-${question.sourceOrder}`,
                order:
                question.sourceOrder,
                context:
                    "excerpt" in question
                        ? question.excerpt?.join(
                            "\n",
                        )
                        : undefined,
            }),
        ),

        {
            type:
                "passage-group",
            id:
                "diagnostic-1-scientific-text",
            order: 18,
            section:
                "scientific-text",
            instruction:
            scientificTextOneTest.instruction,
            passage:
            scientificPassage,
            questions:
                scientificTextOneTest.questions.map(
                    (
                        question,
                    ) =>
                        mapChoiceQuestion(
                            question,
                            "scientific-text",
                        ),
                ),
        },

        {
            type:
                "passage-group",
            id:
                "diagnostic-1-literary-text",
            order: 23,
            section:
                "literary-text",
            title:
            literaryTextOneTest.subtitle,
            instruction:
            literaryTextOneTest.instruction,
            passage:
            literaryPassage,
            questions:
                literaryTextOneTest.questions.map(
                    (
                        question,
                    ) =>
                        mapChoiceQuestion(
                            question,
                            "literary-text",
                        ),
                ),
        },

        {
            type:
                "passage-group",
            id:
                "diagnostic-1-ghazal",
            order: 28,
            section:
                "ghazal",
            title:
            ghazalOneTest.title,
            instruction:
            ghazalOneTest.instruction,
            passage:
            ghazalPassage,
            questions:
                ghazalOneTest.questions.map(
                    (
                        question,
                    ) =>
                        mapChoiceQuestion(
                            question,
                            "ghazal",
                        ),
                ),
        },

        {
            type:
                "matching-group",
            id:
                "diagnostic-1-matching-33-35",
            order: 33,
            section:
                "syntax",
            title:
            mixedMatching.title,
            instruction:
            mixedMatching.instruction,
            items:
                mixedMatching.items.map(
                    (
                        item,
                    ) => ({
                        id:
                            `diagnostic-1-question-${item.sourceOrder}`,
                        order:
                        item.sourceOrder,
                        prompt:
                        item.prompt,
                        correctChoiceId:
                        item.correctChoiceId,
                        maximumScore:
                        item.maximumScore,
                    }),
                ),
            choices:
            mixedMatching.choices,
        },

        ...mixedWrittenQuestions.map(
            (
                question,
            ) => {
                if (
                    question.type ===
                    "short-answer"
                ) {
                    return {
                        type:
                            "short-answer" as const,
                        id:
                            `diagnostic-1-question-${question.sourceOrder}`,
                        order:
                        question.sourceOrder,
                        section:
                            "written" as const,
                        question:
                        question.question,
                        context:
                            "context" in question
                                ? question.context
                                : undefined,
                        image:
                            question.sourceOrder ===
                            36
                                ? {
                                    src:
                                        "/images/diagnostika/diagnostic-1-question-36.png",
                                    alt:
                                        "36-savoldagi ma’nodosh so‘zni topish diagrammasi",
                                    width:
                                        582,
                                    height:
                                        224,
                                }
                                : undefined,
                        examples:
                            "examples" in question
                                ? question.examples
                                : undefined,
                        acceptedAnswers:
                        question.acceptedAnswers,
                        comparison:
                        question.comparison,
                        requiredKeywords:
                            "requiredKeywords" in question
                                ? question.requiredKeywords
                                : undefined,
                        maximumScore:
                        question.maximumScore,
                    };
                }

                return {
                    type:
                        "multipart" as const,
                    id:
                        `diagnostic-1-question-${question.sourceOrder}`,
                    order:
                    question.sourceOrder,
                    section:
                        "written" as const,
                    question:
                    question.question,
                    context:
                    question.context,
                    parts:
                    question.parts,
                    maximumScore:
                        question.sourceOrder ===
                        44
                            ? 1.7
                            : question.maximumScore,
                };
            },
        ),

        {
            type:
                "essay",
            id:
                "diagnostic-1-question-45",
            order: 45,
            section:
                "essay",
            title:
                "ESSE",
            prompt:
                "Quyidagi vaziyat yuzasidan o‘z munosabatingizni yozma bayon qiling.",
            situation:
                "Bugungi kunda televideniye orqali namoyish qilinadigan turli mahsulotlar reklamalariga ko‘pchilik salbiy munosabat bildiradi. Ayrimlar esa bunday reklamalarni kerakli deb hisoblashadi.",
            requirements: {
                minimumWords:
                    200,
                recommendedWords:
                    250,
                introduction: [
                    "Kirish qismi ikki-uch jumladan iborat bo‘lsin.",
                    "Berilgan vaziyat matnini aynan ko‘chirmang.",
                ],
                body: [
                    "Asosiy qism kamida uchta xatboshidan iborat bo‘lsin.",
                    "Har bir xatboshida tomonlarning qarashlari va shaxsiy fikringizni batafsil yoritib boring.",
                    "Fikrlaringizni hayotiy misollar bilan dalillang.",
                    "Shaxsiy mulohazalaringizni batafsil va dalillar asosida yoritib boring.",
                    "Barcha fikr-mulohazalar faqat mavzu doirasida bo‘lsin.",
                ],
                conclusion: [
                    "Asosiy qismdagi fikr-mulohazalarni umumlashtiring.",
                    "Xulosa ikki-uch jumladan iborat bo‘lsin.",
                ],
                warnings: [
                    "Fikr-mulohazalaringizni publitsistik uslubda bayon qiling.",
                    "Fikrlaringizni mantiqiy izchillikda, adabiy til me’yorlariga amal qilgan holda ifodalang.",
                    "Esse uchun reja tuzilmaydi.",
                    "Epigraf qo‘yilmaydi.",
                ],
            },
            maximumScore:
                24,
        },
    ];


function createDiagnosticAudioExplanation(
    order: number,
    partLabel?: string,
) {
    const suffix =
        partLabel
            ? `-${partLabel}`
            : "";

    return {
        audio: {
            src:
                `/audio/tests/milliy-sertifikat/diagnostika/1/question-${order}${suffix}.mp3`,
        },
    } as const;
}

const questions:
    readonly DiagnosticQuestion[] =
    rawQuestions.map(
        (
            question,
        ): DiagnosticQuestion => {
            if (
                question.type ===
                "passage-group"
            ) {
                return {
                    ...question,
                    questions:
                        question.questions.map(
                            (
                                item,
                            ) => ({
                                ...item,
                                explanation:
                                    createDiagnosticAudioExplanation(
                                        item.order,
                                    ),
                            }),
                        ),
                };
            }

            if (
                question.type ===
                "matching-group"
            ) {
                return {
                    ...question,
                    items:
                        question.items.map(
                            (
                                item,
                            ) => ({
                                ...item,
                                explanation:
                                    createDiagnosticAudioExplanation(
                                        item.order,
                                    ),
                            }),
                        ),
                };
            }

            if (
                question.type ===
                "multipart"
            ) {
                return {
                    ...question,
                    parts:
                        question.parts.map(
                            (
                                part,
                            ) => ({
                                ...part,
                                explanation:
                                    createDiagnosticAudioExplanation(
                                        question.order,
                                        part.label,
                                    ),
                            }),
                        ),
                };
            }

            if (
                question.type ===
                "essay"
            ) {
                return question;
            }

            return {
                ...question,
                explanation:
                    createDiagnosticAudioExplanation(
                        question.order,
                    ),
            };
        },
    );

export const diagnosticTestOne =
    {
        kind:
            "diagnostic",

        id:
            "diagnostic-test-1",

        slug:
            "1",

        topic:
            "diagnostika",

        title:
            "To‘liq diagnostika — 1",

        description:
            "Ona tili va adabiyot bo‘yicha 45 ta savoldan iborat to‘liq diagnostika imtihoni.",

        instruction:
            "Barcha topshiriqlarni tartib bilan bajaring. Imtihon vaqti 180 daqiqa.",

        questionCount:
            45,

        estimatedMinutes:
            180,

        maximumScore:
            100,

        difficulty:
            "hard",

        access:
            "free",

        questions,
    } as const satisfies
        DiagnosticTestDefinition;