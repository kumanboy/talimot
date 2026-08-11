import type { EssayCriterionId } from "./types";

export const ESSAY_RUBRIC_VERSION = "uzbmb-essay-v1" as const;

export type RubricCriterion = {
    readonly id: EssayCriterionId;
    readonly label: string;
    readonly scoring: Readonly<Record<"2" | "1.5" | "1" | "0.5" | "0", string>>;
};

export const ESSAY_RUBRIC: readonly RubricCriterion[] = [
    {
        id: "publicistic_style",
        label: "Publitsistik uslub",
        scoring: {
            "2": "To‘liq publitsistik uslubda yozilgan.",
            "1.5": "Ayrim o‘rinlarda publitsistik uslubdan chekinilgan.",
            "1": "Qisman publitsistik uslubda yozilgan.",
            "0.5": "To‘liq badiiy uslubga og‘gan.",
            "0": "To‘liq so‘zlashuv uslubida yozilgan.",
        },
    },
    {
        id: "views_and_opinion",
        label: "Qarashlar va shaxsiy fikr",
        scoring: {
            "2": "Har ikkala qarash hamda muallifning shaxsiy qarashi to‘la yoritilgan.",
            "1.5": "Har ikkala qarash yoritilgan, lekin shaxsiy fikr yetarli darajada yoritilmagan.",
            "1": "Qarashlarning bittasi to‘la yoritilgan.",
            "0.5": "Qarashlarning faqat bittasi qisman yoritilgan.",
            "0": "Qarashlar yoritilmagan.",
        },
    },
    {
        id: "argumentation",
        label: "Dalillash",
        scoring: {
            "2": "Har ikkala qarash vaziyatga mos dalillar bilan asoslangan.",
            "1.5": "Faqat bitta qarash yetarlicha dalillangan.",
            "1": "Dalillarning bir qismi vaziyatga mos yoki yetarli emas.",
            "0.5": "Dalillar asosan vaziyatga mos emas.",
            "0": "Dalillar keltirilmagan.",
        },
    },
    {
        id: "composition",
        label: "Kirish–asosiy qism–xulosa",
        scoring: {
            "2": "Kirish, asosiy qism va xulosa to‘la yoritilgan.",
            "1.5": "Uch qismdan faqat ikkitasi to‘la yoritilgan.",
            "1": "Qismlardan ikkitasi yuza yoritilgan.",
            "0.5": "Faqat bitta qism to‘la yoritilgan.",
            "0": "Faqat bitta qism yuza yoritilgan.",
        },
    },
    {
        id: "paragraph_structure",
        label: "Matn qurilishi va xatboshilar",
        scoring: {
            "2": "Mantiqiy qurilishda va xatboshilarga ajratishda xatolik yo‘q.",
            "1.5": "1–2 o‘rinda mantiqiy qurilish yoki xatboshi xatosi bor.",
            "1": "3–4 o‘rinda xatolik bor.",
            "0.5": "5–6 o‘rinda xatolik bor.",
            "0": "7+ xatolik yoki matn umuman xatboshilarga ajratilmagan.",
        },
    },
    {
        id: "coherence_and_repetition",
        label: "Izchillik va takror",
        scoring: {
            "2": "Izchillikka to‘liq rioya qilingan, sezilarli takror yo‘q.",
            "1.5": "1–2 o‘rinda takror bor, izchillik buzilmagan.",
            "1": "3–4 o‘rinda takror bor yoki izchillik buzilgan.",
            "0.5": "5–6 o‘rinda takror va izchillik muammosi bor.",
            "0": "7+ o‘rinda takror va jiddiy izchillik buzilishi bor.",
        },
    },
    {
        id: "spelling",
        label: "Imlo",
        scoring: {
            "2": "Imlo xatosi yo‘q.",
            "1.5": "1–2 ta imlo xatosi.",
            "1": "3–4 ta imlo xatosi.",
            "0.5": "5–6 ta imlo xatosi.",
            "0": "7+ ta imlo xatosi.",
        },
    },
    {
        id: "punctuation",
        label: "Punktuatsiya",
        scoring: {
            "2": "Punktuatsion xato yo‘q.",
            "1.5": "1–2 ta punktuatsion xato.",
            "1": "3–4 ta punktuatsion xato.",
            "0.5": "5–6 ta punktuatsion xato.",
            "0": "7+ ta punktuatsion xato.",
        },
    },
    {
        id: "suffix_usage",
        label: "Qo‘shimcha qo‘llash",
        scoring: {
            "2": "Qo‘shimcha qo‘llashda xato yo‘q.",
            "1.5": "1–2 ta xato.",
            "1": "3–4 ta xato.",
            "0.5": "5–6 ta xato.",
            "0": "7+ ta xato.",
        },
    },
    {
        id: "word_usage_style",
        label: "So‘z qo‘llash uslubiyati",
        scoring: {
            "2": "So‘z qo‘llash bilan bog‘liq uslubiy xato yo‘q.",
            "1.5": "1–2 ta xato.",
            "1": "3–4 ta xato.",
            "0.5": "5–6 ta xato.",
            "0": "7+ ta xato.",
        },
    },
    {
        id: "lexical_richness",
        label: "Leksik boylik",
        scoring: {
            "2": "Tasviriy ifoda, vaziyatga mos birlik va barqaror birikmalardan unumli foydalanilgan.",
            "1.5": "Bunday birliklardan ayrim o‘rinlarda o‘rinli foydalanilgan.",
            "1": "Ayrim birliklar bor, lekin qo‘llash sust yoki ayrimlari noo‘rin.",
            "0.5": "Xilma-xillik juda sust va noo‘rin qo‘llash bor.",
            "0": "Leksik xilma-xillik deyarli kuzatilmaydi.",
        },
    },
    {
        id: "speech_purity",
        label: "Nutq sofligi",
        scoring: {
            "2": "Sheva, vulgarizm, varvarizm va parazit so‘zlar uchramaydi.",
            "1.5": "1–2 o‘rinda uchraydi, jiddiy uslubiy g‘alizlik tug‘dirmaydi.",
            "1": "3–4 o‘rinda uchraydi va uslubiy g‘alizlik bor.",
            "0.5": "5–6 o‘rinda uchraydi va sezilarli g‘alizlik bor.",
            "0": "7+ o‘rinda uchraydi.",
        },
    },
] as const;
