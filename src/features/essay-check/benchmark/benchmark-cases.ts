import "server-only";

import type { EssayCriterionId, EssayCriterionScore } from "../grading/types";

export type EssayBenchmarkCase = {
    readonly id: string;
    readonly label: string;
    readonly topic: string;
    readonly topicWasInferred?: boolean;
    readonly situationText?: string | null;
    readonly essayText: string;
    readonly teacherRawScore: number;
    readonly teacherScaledScore: number;
    readonly teacherCriteria: Readonly<Record<EssayCriterionId, EssayCriterionScore>>;
    readonly teacherFeedback: string;
};

export const ESSAY_BENCHMARK_CASES: readonly EssayBenchmarkCase[] = [
    {
        id: "essay-1-ai",
        label: "1-esse · Sun’iy intellekt",
        topic: "Sun'iy intellektning salbiy va ijobiy tomoni",
        situationText: null,
        essayText: "Keng islohatlar maydoniga aylanib borayotgan yangi Õzbekistonimizda AIga doir bir nechta õzgarishlar amalga oshirilmoqda. Ba'zi insonlar sun'iy entilektni salbiy baxolashsa, ayrimlar esa yaxshi ekanligini ta'kidlamoqda. Aslida( jamiyat ravnaqi , yoshlar kelajagi, aholi ravnaqi, xalq farovonligi...) uchun qay bir tomonning fikrlari õrinli?\n\nSun'iy entilektni salbiy deb belgilaganlarning fikrlariga e'tibor beradigan bõlsak ularning bunday tõxtamga kelishlariga yetarlicha asoslar bor.AIdan foydalanish, birinchidan fikrlash doirasini qisqarishiga sabab bõladi. Xitoy davlati ta'lim agentligi ta'kidlashicha \"Bola AIdagi tayyor narsalarga miyya faoliyatini õrgatib qõysa ,bu holat bolaning 70%ga miyya taffakurlash reflikisini qisqartiradi\", —deya \"Darakchi\" gazetasida yoziladi.\n\nIkkinchidan esa dangasalikga va bilimsizlikga sabab bõladi. \"Kun.uz\" saytida 136 maktab õqituvchisi Axror.N interviyusida \"Hozirda bolalar tayyor narsalarni kõchirib yozishga õrganib qolishgan, õzlari fikrlab topib emas ,aksincha, \"Chatgpt\" noi sun'iy entilektdan kõchirib kelishmoqda va bu ilmga bõlgan qiziqishlarini sundirib, dangasa qilib qõymoqda. Agar shu tarzda ketadigan bõlsak rivojlanishdan ortda qolishimiz tayin\",—deya ma'lumot berib õtgan.\n\n\"Haqiqat—bahs munozaralarda aks etadi\", —deganlaridek, hamda zamonaviy jamiyatning  har bir a'zosi istalgan shaxsiy fikrga ega ekanligini inobatga olsak, ushbu masala yuzasidan AIdan foydalanish yaxshi degan insonlarning qarashlari farqli. Avvalo, vedio roliklar yaratish oson va yuzim kõrinmasin degan blog yurituvchilari uchun juda samarali. \"Sara xabarlar\" saytida ma'lum bõlishicha 56% blog yurituvchilar AI dan foydalanib õz maxsulotlarini reklama qilmoqda. Bundan tashqari, turli tillardan õz tilimizga õzgartirib bera oladi. \"Gulxan\" gazetasida \"Translete\" AIdan 2mlrn inson foydalanib kelmoqdaligi e'tirof etilgan.\n\nMening fikrimcha, sun'iy entilektni salbiy deya belgilagan insonlar qarashlariga kõz yuma olmasamda AIga ijobiy fikr bildirganlarning qarashlarini qõllab quvvatlayman. Chunki AIda tõğri foydalansa hech qanday ziyoni yõq aksincha daromatga ham olib chiqadi. Komiljon pro dasturchi AIdan tõğri foydalanib hozirda yillik daromadi 1mlrddan oshiq ekanligi onlayn vebenarida ma'lum etadi.\n\nXulosa qilib aytganda AIdan kerakli maqsadlarda ishlatish yaxshi. Zero, \"Texnologiya tõğri ishlatilsa , imkoniyatlar bir necha barobarga oshadi\".",
        teacherRawScore: 18.5,
        teacherScaledScore: 64,
        teacherCriteria: {
            publicistic_style: 1.5,
            views_and_opinion: 1.5,
            argumentation: 2,
            composition: 1.5,
            paragraph_structure: 2,
            coherence_and_repetition: 1.5,
            spelling: 1,
            punctuation: 1,
            suffix_usage: 1.5,
            word_usage_style: 1.5,
            lexical_richness: 1.5,
            speech_purity: 2,
        },
        teacherFeedback: "Essening mavzuga yondashuvi to‘g‘ri, ikkala qarash ham yoritilgan va muallif o‘z pozitsiyasini bildirgan. Biroq dalillarni tartibga solish, 2-xatboshi talablarini bajarish va imlo-punktuatsiya ustida ishlash orqali ish sifatini ancha oshirish mumkin.",
    },
    {
        id: "essay-2-utilities",
        label: "2-esse · Kommunal to‘lovlar",
        topic: "Kommunal to‘lovlar iqtisodiyot uchun zarurmi yoki aholining sharoitiga mos belgilanishi kerakmi?",
        topicWasInferred: true,
        situationText: null,
        essayText: "Bugungi kunda kommunal toʻlovlar jamiyat hayotining ajralmas qismi hisoblanadi. Elektr, gaz va suv kabi xizmatlarning uzluksiz ishlashi katta mablagʻ talab etadi. Shu sababli kommunal toʻlovlar davlat tomonidan joriy etilgan. Ushbu masala yuzasidan jamiyatda turli qarashlar mavjud boʻlib, ayrimlar uni iqtisodiyot uchun zarur desa, boshqalar toʻlovlar aholining sharoitiga mos boʻlishi kerakligini taʼkidlaydi. Aslida jamiyat rivoji uchun qaysi bir tomonning qarashlari oʻrinli?\n\nBirinchi taraf fikricha, kommunal toʻlovlar davlat iqtisodiyotini yuksaltiradi, chunki ushbu toʻlovlar davlat byudjetining muhim manbai boʻlib, infratuzilmani rivojlantirishga xizmat qiladi. Elektr va gaz tarmoqlarining yangilanishi ham aynan shu mablagʻlar hisobiga oshiriladi. Natijada xizmatlar sifati oshadi va iqtisodiy barqarorlik taʼminlanadi.\n\nIkkinchi taraf esa kommunal toʻlovlar aholining ijtimoiy sharoitidan kelib chiqib belgilanishi kerak, degan fikrni bildiradi. Bu qarash ham eʼtiborga loyiqdir. Chunki jamiyatda barcha insonlarning daromadi bir xil emas. Baʼzi oilalar kam taʼminlangan hisoblanadi. Ular uchun yuqori kommunal toʻlovlar ogʻirlik qiladi. Kommunal xarajatlar oila byudjetining katta qismini egallaydi. Narxlarning oshishi norozilikni keltirib chiqaradi. Bu holat ijtimoiy muammolarga sabab boʻlishi mumkin.Aholi manfaatini himoya qilish davlatning asosiy vazifalaridan biridir. Chunki davlat xalq uchun xizmat qiladi. Toʻlovlar adolatli boʻlishi muhim. Kam taʼminlangan qatlam eʼtibordan chetda qolmasligi kerak. Ijtimoiy tenglikni saqlash lozim. Imtiyozlar va subsidiyalar joriy etilishi mumkin.Bunga misol sifatida, Navoiy viloyati Nurota tumanida ayrim kam taʼminlangan oilalar kommunal toʻlovlarning oshishi sababli oʻz vaqtida toʻlovlarni amalga oshira olmayotganini kuzatish mumkin.\n\nMening fikrimcha ikkinchi taraf ilgari surayotgan fikrlarni inobatga olsam-da, lekin kommunal toʻlovlarning iqtisodiy jihatdan asoslangan holda belgilanishi davlat taraqqiyoti uchun ustuvor boʻlishi kerak, deb hisoblayman. Chunki barqaror va yetarli kommunal tushumlar boʻlmasa, xizmat koʻrsatuvchi tizimlar zarar koʻradi. Shu sababli aholi sharoitini hisobga olib imtiyoz va ijtimoiy qoʻllab-quvvatlash orqali amalga oshirilishi, kommunal toʻlovlar esa davlat iqtisodiyotini mustahkamlashga xizmat qilishi lozim.\n\nXulosa qilib aytganda, kommunal toʻlovlarning iqtisodiy jihatdan asoslangan boʻlishi davlat barqarorligi va taraqqiyoti uchun muhim ahamiyatga ega. Aholi sharoitini hisobga olish zarur boʻlsa-da, bu masala iqtisodiy tizimni zaiflashtirmasligi lozim. “Tok joyida ogʻir”, yaʼni har bir masala oʻz oʻrnida va meʼyorida hal etilgandagina jamiyatda barqarorlik va farovonlik taʼminlanadi.",
        teacherRawScore: 14.5,
        teacherScaledScore: 56,
        teacherCriteria: {
            publicistic_style: 1.5,
            views_and_opinion: 1,
            argumentation: 1,
            composition: 1,
            paragraph_structure: 1,
            coherence_and_repetition: 1,
            spelling: 2,
            punctuation: 1,
            suffix_usage: 1.5,
            word_usage_style: 1,
            lexical_richness: 1,
            speech_purity: 1.5,
        },
        teacherFeedback: "",
    },
    {
        id: "essay-3-digital-art",
        label: "3-esse · Raqamli san’at",
        topic: "Kompyuter orqali yaratilgan san’at asarlari foydalimi yoki san’at uchun xavfmi?",
        topicWasInferred: true,
        situationText: null,
        essayText: "Bugungi kunda rivojlanib borayotgan hayotimizda turli xil raqamli san’at asarlari ko`paymoqda.Ayrimlar kompyuter orqali yaratilgan san`at asarlariga ijobiy munosabat bildiradi, boshqalar esa bu san`at uchun xavfli deya e`tiroz bildirishadi.Xo`sh ,aslida,qaysi biri manfaatliroq?\n\nBir tomondan olib qaraganda,kompyuter orqali yaratilgan asarlarni ma`qul ko`ruvchilarning bu qarorga kelishlariga yetarli asoslari mavjud.Birinchidan, maxsus dasturlar san`atkorlarga ijod  qilishni osonlashtirmoqda.Ular qisqa muddatda rasm,grafika va turli xil animatsiyalar yaratish imkoniga ega bo`lmoqda.Masalan,bugungi kunda rassomlar Photoshop va Procreate dasturlari orqali rasmlar yaratmoqda.Bu esa kompyuterda san’at yaratishda qulay vosita ekanini isbotlaydi.Ikkinchidan,san`at asarlarini saqlash va tarqatishning qulayligidir\nIjtimoiy tarmoqlar orqali bu asarlar tezda ko`plab odamlarga yetib boradi va san`atkor o`z ijodini butun dunyoga namoyish eta oladi.Misol tariqasida,Instagram,Teligram va boshqa platformalarida rassomlar o`z raqamli san`at asarlarini joylab , qisqa vaqt ichida minglab tomashabinlarga yetkazmoqda.\n\nShunga qaramay, bir qator sabablarga ko`ra bu san`at uchun xavfli deb ustun ko`ruvchilar ham topiladi. Avvalo,bunday asarlarda qo`l mehnati kam bo`lib,texnologiya asosiy rol o`ynaydi.Statistik ma`lumotlarga ko`ra , raqamli san`at mahsulotlarini san`at deb qabul qilmaydiganlar ko`p.Qolaversa, raqamli san`at asarlarini oson nusxalash mumkinligi sabali ularning qadri va noyobligi pasayadi. Tadqiqotlarga ko`ra ,raqamli san`at asarlarining 80% dan ortig`i internet orqali ruxsatsiz nusxalanadi va tarqatiladi.\n\nMening fikrimcha,kompyuter orqali yaratilgan san`at ham haqiqiy ijod hisoblanadi.Kompyuter orqali san`at asarlarini yaratish tez va oson. Shuni misol keltirish mumkinki, Pixar va DreamWorks kabi studiyalar kompyuter yordamida yaratilgan multifilmlari bilan dunyoda tan olinadi.\n\nXulosa qilib aytganda, kompyuter yordamida yaratilgan san`at jamiyatga foyda keltiradi, chunki u odamlarning estetik didini rivojlantiradi va ijodkorlikni rag`batlantiradi.Zero,,Raqamli dunyoda chizilgan har bir chiziq – bu ijodning yangi imkoniyati’’,-deb bejizga aytilmagan.",
        teacherRawScore: 16,
        teacherScaledScore: 59,
        teacherCriteria: {
            publicistic_style: 1.5,
            views_and_opinion: 1,
            argumentation: 1.5,
            composition: 2,
            paragraph_structure: 1.5,
            coherence_and_repetition: 1.5,
            spelling: 1,
            punctuation: 1,
            suffix_usage: 1.5,
            word_usage_style: 1,
            lexical_richness: 1,
            speech_purity: 1.5,
        },
        teacherFeedback: "",
    },
] as const;

export function getEssayBenchmarkCase(id: string): EssayBenchmarkCase | null {
    return ESSAY_BENCHMARK_CASES.find((item) => item.id === id) ?? null;
}
