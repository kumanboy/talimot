import type { EssayCriterionId } from "./types";

export const ESSAY_RUBRIC_VERSION = "uzbmb-essay-v3" as const;

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
            "2": "Esse publitsistik uslubni izchil saqlaydi: ijtimoiy mavzu, rasmiy-ommabop ohang, ta’sirchan va me’yoriy bayon mavjud; sezilarli uslubiy chekinish yo‘q.",
            "1.5": "Publitsistik uslub asosan saqlangan, ammo ayrim o‘rinlarda so‘zlashuv, noaniq yoki ortiqcha badiiy ifoda kabi mahalliy chekinishlar bor.",
            "1": "Publitsistik uslub qisman saqlangan; bir necha sezilarli uslubiy chekinish yoki norasmiy bayon bor, ammo matnning umumiy yo‘nalishi publitsistikligicha qoladi.",
            "0.5": "Matnning katta qismi publitsistik uslubdan chetga chiqqan, ohang va bayon vazifaga sust moslashgan.",
            "0": "Publitsistik uslub amalda kuzatilmaydi yoki matn boshqa uslubda yozilgan.",
        },
    },
    {
        id: "views_and_opinion",
        label: "Qarashlar va shaxsiy fikr",
        scoring: {
            "2": "Har ikkala qarash mazmunan yetarli ochilgan; alohida shaxsiy fikrda muallif qaysi tomonni tanlagani ravshan, tanlov sababi va uni tasdiqlovchi dalil/misol aniq berilgan.",
            "1.5": "Ikki qarash ham yoritilgan va shaxsiy pozitsiya aniq, ammo qarashlardan biri, tanlov sababi yoki shaxsiy fikr dalili yetarlicha chuqur ochilmagan.",
            "1": "Ikki qarash mavjud, biroq yoritilish muvozanatsiz; yoki shaxsiy fikrda tomon tanlansa-da, tanlov sababi/dalili sust, chalkash yoki asosan takroriy hukmlarga tayangan.",
            "0.5": "Qarashlardan biri juda yuzaki yoki shaxsiy pozitsiya deyarli asoslanmagan/noaniq.",
            "0": "Qarama-qarshi qarashlar va muallifning aniq pozitsiyasi mazmunan shakllanmagan.",
        },
    },
    {
        id: "argumentation",
        label: "Dalillash",
        scoring: {
            "2": "Har bir TOMONNING mazmuniy blokida (u bitta yoki ketma-ket bir necha abzats bo‘lishi mumkin) jami kamida 2 sabab va ularga mantiqan bog‘langan kamida 2 dalil/misol bor; sabab–dalil munosabati aniq va mavzuga xizmat qiladi.",
            "1.5": "Ikki tomon ham sabab va dalillar bilan ochilgan, ammo tomonlardan birida 2 sabab + 2 dalil talabi to‘liq emas, dalillardan biri yuzaki yoki ayrim sabab–dalil bog‘lanishlari sust.",
            "1": "Sabablar bor, lekin dalillar yetarli emas/yuzaki; yoki bir tomon ancha yaxshi asoslangan, ikkinchi tomon esa aniq kamroq dalillangan.",
            "0.5": "Asosan umumiy hukmlar mavjud; sabab va dalil o‘rtasidagi aloqa juda sust, konkret asoslash juda kam.",
            "0": "Mazmuniy dalillash amalda mavjud emas.",
        },
    },
    {
        id: "composition",
        label: "Kirish–asosiy qism–xulosa",
        scoring: {
            "2": "Kirish odatda 3 gap, zaruratda ko‘pi bilan 4 gap; mavzu, ikki qarash va tezis/savol aniq. Asosiy qismda ikki tomon va alohida shaxsiy fikr rivojlantirilgan. Xulosa qisqa, yangi fikrsiz, tanlangan pozitsiyani umumlashtiradi va kirishdagi tezis savoliga javob beradi.",
            "1.5": "Uch katta qism mavjud va vazifasini asosan bajaradi, ammo kirish uzunligi/tezisi, asosiy qism funksiyalaridan biri yoki xulosaning tezisga qaytishida bitta sezilarli kamchilik bor.",
            "1": "Kirish, asosiy qism va xulosa mavjud, biroq kamida ikki muhim kompozitsion talab buzilgan: masalan kirish 5+ gap, shaxsiy fikr sust ajratilgan, xulosa yangi fikr kiritgan yoki tezisga yetarli qaytmagan.",
            "0.5": "Uch qismdan faqat bittasi yetarli shakllangan, qolganlari juda sust yoki chegaralari noaniq.",
            "0": "Kirish–asosiy qism–xulosa tizimi amalda shakllanmagan yoki muhim qism(lar) yo‘q.",
        },
    },
    {
        id: "paragraph_structure",
        label: "Matn qurilishi va xatboshilar",
        scoring: {
            "2": "Funksional bloklar aniq ajralgan: kirish; 1-tomon; 2-tomon; alohida shaxsiy fikr; xulosa. Bir tomonning mazmuniy bloki mantiqan bog‘langan ketma-ket 2 abzatsga bo‘linishi mumkin va bu o‘z-o‘zidan xato emas. Xatboshilar o‘rtasidagi chegara va vazifalar ravshan.",
            "1.5": "Funksional bloklar saqlangan, ammo 1–2 joyda abzats chegarasi, hajm muvozanati yoki fikrning qaysi blokka tegishliligi sust.",
            "1": "Bir nechta sezilarli qurilish muammosi bor: juda uzun/ortiqcha zich abzats, kerakli funksional blokning sust ajralishi yoki fikrlarning bloklararo noto‘g‘ri joylashuvi.",
            "0.5": "Xatboshi qurilishi tez-tez buzilgan; funksional bloklarni ajratish qiyinlashadi.",
            "0": "Matn deyarli xatboshilarga ajratilmagan yoki funksional qurilish butunlay buzilgan.",
        },
    },
    {
        id: "coherence_and_repetition",
        label: "Izchillik va takror",
        scoring: {
            "2": "Fikrlar izchil rivojlanadi, sababdan dalilga va blokdan blokka o‘tish tabiiy; sezilarli mazmuniy takror yo‘q.",
            "1.5": "Ayrim takror yoki o‘tishdagi sustlik bor, ammo umumiy mantiqiy ketma-ketlik aniq saqlangan.",
            "1": "Bir necha mazmuniy takror, mantiqiy sakrash yoki sabab–dalil ketma-ketligida uzilish bor; ular matn sifatini sezilarli pasaytiradi.",
            "0.5": "Takror va mantiqiy uzilishlar tez-tez uchraydi, mazmunni kuzatish qiyinlashadi.",
            "0": "Izchillik jiddiy buzilgan va matn mazmunini kuzatish juda qiyin.",
        },
    },
    {
        id: "spelling",
        label: "Imlo",
        scoring: {
            "2": "Sezilarli imlo xatosi yo‘q yoki faqat tasodifiy, bahoga ta’sir qilmaydigan juda mayda terish nuqsoni bor.",
            "1.5": "Bir necha mahalliy, mustaqil imlo xatosi bor; ular tizimli emas va umumiy savodxonlik yuqori darajada saqlangan.",
            "1": "Imlo xatolari ko‘p va ko‘zga tashlanadi, biroq matn baribir oson o‘qiladi va ma’no odatda aniq; bu daraja ko‘p xatoli, ammo tushunarli esse uchun odatiy.",
            "0.5": "Imlo xatolari juda tez-tez uchraydi va o‘qishni sezilarli qiyinlashtira boshlaydi.",
            "0": "Imlo tizimi jiddiy buzilgan, xatolar pervasive va matnning katta qismini anglashga to‘sqinlik qiladi. Faqat xatolar soni ko‘p bo‘lgani uchun avtomatik 0 bermang.",
        },
    },
    {
        id: "punctuation",
        label: "Punktuatsiya",
        scoring: {
            "2": "Punktuatsiya deyarli to‘liq me’yoriy; sezilarli tinish belgisi xatosi yo‘q.",
            "1.5": "Ayrim mahalliy punktuatsion xatolar bor, ammo gap chegaralari va sintaktik tuzilish aniq.",
            "1": "Punktuatsion xatolar takroran uchraydi, biroq matnning o‘qilishi va ma’nosi asosan saqlanadi.",
            "0.5": "Punktuatsiya xatolari tez-tez gap chegaralari yoki mazmuniy bog‘lanishni noaniqlashtiradi.",
            "0": "Punktuatsiya jiddiy buzilgan va gap tuzilishini anglash muntazam ravishda qiyinlashadi.",
        },
    },
    {
        id: "suffix_usage",
        label: "Qo‘shimcha qo‘llash",
        scoring: {
            "2": "Kelishik, egalik, shaxs-son, nisbat va boshqa qo‘shimchalar me’yoriy; sezilarli morfologik xato yo‘q.",
            "1.5": "Bir necha mahalliy qo‘shimcha qo‘llash xatosi bor, ammo grammatik tizim asosan to‘g‘ri va xatolar ma’noni buzmaydi.",
            "1": "Qo‘shimcha qo‘llash xatolari takrorlanadi yoki ayrim gaplarda grammatik munosabatni sezilarli buzadi.",
            "0.5": "Morfologik xatolar tez-tez uchraydi va ko‘plab gaplarning me’yoriyligini pasaytiradi.",
            "0": "Qo‘shimcha qo‘llash tizimi jiddiy buzilgan va grammatik munosabatlarni anglash ko‘p joyda qiyin.",
        },
    },
    {
        id: "word_usage_style",
        label: "So‘z qo‘llash uslubiyati",
        scoring: {
            "2": "So‘zlar kontekstga aniq va tabiiy tanlangan; noo‘rin birikma yoki uslubiy so‘z tanlash xatosi deyarli yo‘q.",
            "1.5": "Ayrim noaniq/noo‘rin so‘z tanlovi yoki g‘aliz birikma bor, ammo umumiy ifoda tabiiy va tushunarli.",
            "1": "Bir necha sezilarli noo‘rin so‘z tanlovi, ortiqcha birikma yoki g‘aliz ifoda bor; ular uslubiy sifatni pasaytiradi.",
            "0.5": "Noo‘rin so‘z tanlash va g‘aliz birikmalar tez-tez uchraydi.",
            "0": "So‘z qo‘llashdagi xatolar matnning katta qismini uslubiy va mazmuniy jihatdan buzadi.",
        },
    },
    {
        id: "lexical_richness",
        label: "Leksik boylik",
        scoring: {
            "2": "Lug‘at diapazoni keng, aniq va xilma-xil; sinonimik, publitsistik va obrazli vositalar tabiiy ishlatilgan, takror kam.",
            "1.5": "Leksik xilma-xillik yaxshi, bir necha boyituvchi birliklar o‘rinli, ammo ayrim takror yoki oddiy konstruksiyalar bor.",
            "1": "Lug‘at zaxirasi yetarli, ammo asosan oddiy va takroriy; iqtibos/statistika/maqolning mavjudligi o‘z-o‘zidan boylikni oshirmaydi.",
            "0.5": "Leksik diapazon ancha cheklangan, bir xil so‘z va konstruksiyalar ko‘p takrorlanadi.",
            "0": "Leksik xilma-xillik juda past va fikrni ifodalash imkoniyati keskin cheklangan.",
        },
    },
    {
        id: "speech_purity",
        label: "Nutq sofligi",
        scoring: {
            "2": "Nutq asosan adabiy va toza; mavzuga mos texnik atamalar, brend nomlari va xalqaro terminlar (masalan AI, ChatGPT, Photoshop) o‘z-o‘zidan nutq sofligi xatosi hisoblanmaydi.",
            "1.5": "Ayrim g‘alizlik, noo‘rin begona birlik, kalkalash yoki norasmiy ifoda bor, ammo nutqning umumiy adabiyligi saqlangan.",
            "1": "Bunday noo‘rin birliklar takroran uchraydi va nutq sifatini sezilarli pasaytiradi.",
            "0.5": "Nutq sofligini buzuvchi birliklar tez-tez uchraydi va umumiy uslubga kuchli ta’sir qiladi.",
            "0": "Nutq sofligi jiddiy buzilgan; matn noo‘rin jargon, sheva, varvarizm yoki boshqa begona birliklarga haddan tashqari to‘yingan.",
        },
    },
] as const;
