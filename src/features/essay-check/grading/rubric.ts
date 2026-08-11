import type { EssayCriterionId } from "./types";

export const ESSAY_RUBRIC_VERSION = "uzbmb-essay-v2" as const;

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
            "2": "Esse izchil publitsistik uslubda, rasmiy-ijtimoiy ohangda va auditoriyaga ta’sir qiluvchi tarzda yozilgan; sezilarli uslubiy chekinish yo‘q.",
            "1.5": "Publitsistik uslub asosan saqlangan, ammo ayrim o‘rinlarda so‘zlashuv, badiiy yoki noaniq uslubiy chekinishlar bor.",
            "1": "Publitsistik uslub qisman saqlangan; bir necha sezilarli uslubiy chekinish bor.",
            "0.5": "Matnning katta qismi publitsistik uslubdan chetga chiqqan.",
            "0": "Publitsistik uslub deyarli kuzatilmaydi.",
        },
    },
    {
        id: "views_and_opinion",
        label: "Qarashlar va shaxsiy fikr",
        scoring: {
            "2": "Har ikkala qarash mazmunan ochilgan; shaxsiy fikr alohida va aniq ifodalangan, qaysi tomon tanlangani ravshan, tanlov sababi hamda uni tasdiqlovchi dalil mavjud.",
            "1.5": "Har ikkala qarash yoritilgan va shaxsiy pozitsiya mavjud, ammo tanlov sababi yoki uni tasdiqlovchi dalil yetarli darajada ochilmagan.",
            "1": "Ikki qarash tilga olingan bo‘lsa-da, ulardan biri sust yoritilgan yoki shaxsiy pozitsiya noaniq/yetarlicha asoslanmagan.",
            "0.5": "Faqat bitta qarash qisman yoritilgan yoki shaxsiy fikr juda yuzaki.",
            "0": "Qarama-qarshi qarashlar va muallif pozitsiyasi mazmunan yoritilmagan.",
        },
    },
    {
        id: "argumentation",
        label: "Dalillash",
        scoring: {
            "2": "Birinchi qarash abzatsida kamida 2 sabab va ularga bog‘langan kamida 2 dalil, ikkinchi qarash abzatsida ham kamida 2 sabab va 2 dalil mavjud; sabab–dalil munosabati aniq va mavzuga xizmat qiladi.",
            "1.5": "Ikki tomon ham dalillangan, lekin tomonlardan birida 2 sabab + 2 dalil talabi to‘liq bajarilmagan yoki ayrim sabab–dalil bog‘lanishlari sust.",
            "1": "Sabablar mavjud, ammo dalillar yetarli emas/yuzaki; yoki bir tomon ancha yaxshi, ikkinchi tomon sust dalillangan.",
            "0.5": "Asosan umumiy hukmlar bor, sabab va dalil o‘rtasidagi aloqa juda sust; real asoslash deyarli yo‘q.",
            "0": "Dalillash mavjud emas.",
        },
    },
    {
        id: "composition",
        label: "Kirish–asosiy qism–xulosa",
        scoring: {
            "2": "Kirish odatda 3 gapdan, zarurat bo‘lsa ko‘pi bilan 4 gapdan iborat; unda mavzu, ikki qarash va tezis savoli aniq. Asosiy qismda ikki tomon hamda alohida shaxsiy fikr rivojlantirilgan. Xulosa qisqa, yangi fikrsiz, tanlangan pozitsiyani umumlashtiradi va kirishdagi tezis savoliga aniq javob beradi.",
            "1.5": "Uch qism mavjud va umumiy vazifasini bajaradi, ammo kirish hajmi/tezisi, asosiy qismning tarkibi yoki xulosaning tezisga qaytishi bo‘yicha bitta sezilarli kamchilik bor.",
            "1": "Kirish, asosiy qism va xulosa mavjud, lekin kamida ikki qism talab darajasida ochilmagan yoki xulosa tezisni tasdiqlamaydi/yangi fikr kiritadi.",
            "0.5": "Faqat bitta qism yetarli shakllangan, qolgan qismlar juda sust yoki chegaralari noaniq.",
            "0": "Kompozitsion tuzilma talabga javob bermaydi; qism(lar) amalda yo‘q.",
        },
    },
    {
        id: "paragraph_structure",
        label: "Matn qurilishi va xatboshilar",
        scoring: {
            "2": "Xatboshilar funksional jihatdan to‘g‘ri ajratilgan: kirish; 1-tomon (2 sabab + 2 dalil); 2-tomon (2 sabab + 2 dalil); alohida shaxsiy fikr (tanlov + sabab + dalil); qisqa xulosa. Mantiqiy joylashuvda sezilarli xato yo‘q.",
            "1.5": "Asosiy xatboshi tuzilishi saqlangan, ammo 1–2 joyda fikr noto‘g‘ri abzatsga ko‘chgan, xatboshi chegarasi yoki funksiyasi sust.",
            "1": "3–4 ta sezilarli xatboshi/mantiqiy qurilish muammosi bor yoki kerakli funksional abzatslardan biri yetarlicha ajralmagan.",
            "0.5": "5–6 ta sezilarli qurilish muammosi bor; xatboshilar mavzu vazifalariga mos kelmaydi.",
            "0": "Matn deyarli xatboshilarga ajratilmagan yoki funksional qurilish butunlay buzilgan.",
        },
    },
    {
        id: "coherence_and_repetition",
        label: "Izchillik va takror",
        scoring: {
            "2": "Fikrlar izchil rivojlangan, sababdan dalilga va abzatsdan abzatsga o‘tish tabiiy; sezilarli takror yo‘q.",
            "1.5": "1–2 o‘rinda takror yoki o‘tishdagi sustlik bor, ammo umumiy izchillik saqlangan.",
            "1": "3–4 o‘rinda takror, mantiqiy sakrash yoki sabab–dalil ketma-ketligida uzilish bor.",
            "0.5": "5–6 o‘rinda takror va mantiqiy uzilishlar mazmunni sezilarli zaiflashtiradi.",
            "0": "Izchillik jiddiy buzilgan, ko‘p takror va mantiqiy uzilishlar mavjud.",
        },
    },
    {
        id: "spelling",
        label: "Imlo",
        scoring: {
            "2": "Imlo xatosi yo‘q.",
            "1.5": "1–2 ta mustaqil imlo xatosi yoki xato turi.",
            "1": "3–4 ta mustaqil imlo xatosi yoki xato turi.",
            "0.5": "5–6 ta mustaqil imlo xatosi yoki xato turi.",
            "0": "7+ ta mustaqil imlo xatosi yoki xato turi.",
        },
    },
    {
        id: "punctuation",
        label: "Punktuatsiya",
        scoring: {
            "2": "Punktuatsion xato yo‘q.",
            "1.5": "1–2 ta mustaqil punktuatsion xato yoki xato turi.",
            "1": "3–4 ta mustaqil punktuatsion xato yoki xato turi.",
            "0.5": "5–6 ta mustaqil punktuatsion xato yoki xato turi.",
            "0": "7+ ta mustaqil punktuatsion xato yoki xato turi.",
        },
    },
    {
        id: "suffix_usage",
        label: "Qo‘shimcha qo‘llash",
        scoring: {
            "2": "Qo‘shimcha qo‘llashda xato yo‘q.",
            "1.5": "1–2 ta mustaqil qo‘shimcha qo‘llash xatosi yoki xato turi.",
            "1": "3–4 ta mustaqil xato yoki xato turi.",
            "0.5": "5–6 ta mustaqil xato yoki xato turi.",
            "0": "7+ ta mustaqil xato yoki xato turi.",
        },
    },
    {
        id: "word_usage_style",
        label: "So‘z qo‘llash uslubiyati",
        scoring: {
            "2": "So‘z tanlash va birikmalarda uslubiy xato yo‘q.",
            "1.5": "1–2 ta mustaqil so‘z qo‘llash/uslubiy xato yoki xato turi.",
            "1": "3–4 ta mustaqil xato yoki xato turi.",
            "0.5": "5–6 ta mustaqil xato yoki xato turi.",
            "0": "7+ ta mustaqil xato yoki xato turi.",
        },
    },
    {
        id: "lexical_richness",
        label: "Leksik boylik",
        scoring: {
            "2": "Lug‘at zaxirasi xilma-xil; parafraza/tasviriy ifoda, ibora, maqol yoki iqtibos kabi birliklar tabiiy va vaziyatga mos qo‘llangan, sun’iy bezak hissi yo‘q.",
            "1.5": "Leksik xilma-xillik yaxshi, ayrim boyituvchi birliklar o‘rinli; biroq takror yoki yuzaki bezak bor.",
            "1": "Lug‘at zaxirasi o‘rtacha; ayrim boyituvchi birliklar mavjud, lekin qo‘llanishi sust/noo‘rin yoki takror ko‘p.",
            "0.5": "Leksik xilma-xillik juda cheklangan, bir xil so‘z va konstruksiyalar ko‘p.",
            "0": "Leksik xilma-xillik deyarli yo‘q.",
        },
    },
    {
        id: "speech_purity",
        label: "Nutq sofligi",
        scoring: {
            "2": "Sheva, vulgarizm, varvarizm, parazit so‘z va noo‘rin begona birliklar uchramaydi; nutq ravon va adabiy.",
            "1.5": "1–2 mustaqil g‘alizlik yoki noo‘rin begona birlik bor, lekin nutqning umumiy sofligiga kuchli zarar bermaydi.",
            "1": "3–4 mustaqil g‘alizlik/noo‘rin birlik bor va nutq sifati sezilarli pasayadi.",
            "0.5": "5–6 mustaqil g‘alizlik/noo‘rin birlik bor.",
            "0": "7+ mustaqil g‘alizlik/noo‘rin birlik bor yoki nutq sofligi jiddiy buzilgan.",
        },
    },
] as const;
