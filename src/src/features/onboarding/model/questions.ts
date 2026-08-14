import type {
  CategoryOptionId,
  CertificateLevelOptionId,
  CurrentPreparationOptionId,
  DailyTimeOptionId,
  EssayLevelOptionId,
  ExamTimeOptionId,
  OnboardingOption,
  OnboardingQuestionDefinition,
  OnboardingQuestionId,
  PreviousExamOptionId,
  PreviousResultOptionId,
  ReturningChoiceOptionId,
  SubjectDirectionOptionId,
  WeakTopicOptionId,
  WeeklyDaysOptionId,
} from "./types";

const singleChoiceInstruction = "Bittasini tanlang";

const certificateLevelOptions = [
  { id: "a-plus", label: "A+" },
  { id: "a", label: "A" },
  { id: "b-plus", label: "B+" },
  { id: "b", label: "B" },
  { id: "c-plus", label: "C+" },
  { id: "c", label: "C" },
] as const satisfies readonly OnboardingOption<CertificateLevelOptionId>[];

export const approvedQuestionOrder = [
  "category",
  "subject-direction",
  "previous-exam",
  "previous-result",
  "target-level",
  "exam-time",
  "weak-topics",
  "daily-time",
  "weekly-days",
  "essay-level",
  "current-preparation",
] as const satisfies readonly OnboardingQuestionId[];

export const questionsById: Readonly<
  Record<OnboardingQuestionId, OnboardingQuestionDefinition>
> = {
  category: {
    id: "category",
    prompt: "Siz qaysi toifaga kirasiz?",
    instruction: singleChoiceInstruction,
    selection: "single",
    options: [
      { id: "school-student", label: "Maktab o‘quvchisiman" },
      {
        id: "applicant-or-university-student",
        label: "Abituriyent yoki talabaman",
      },
      {
        id: "native-language-teacher",
        label: "Ona tili o‘qituvchisiman",
      },
    ] satisfies readonly OnboardingOption<CategoryOptionId>[],
  },
  "subject-direction": {
    id: "subject-direction",
    prompt: "Milliy sertifikat sizga qaysi yo‘nalish uchun kerak?",
    instruction: singleChoiceInstruction,
    selection: "single",
    options: [
      { id: "primary-subject", label: "Asosiy fan sifatida" },
      { id: "mandatory-subject", label: "Majburiy fan sifatida" },
    ] satisfies readonly OnboardingOption<SubjectDirectionOptionId>[],
  },
  "previous-exam": {
    id: "previous-exam",
    prompt: "Milliy sertifikat imtihonini avval topshirganmisiz?",
    instruction: singleChoiceInstruction,
    selection: "single",
    options: [
      { id: "previously-taken", label: "Ha, topshirganman" },
      { id: "first-time", label: "Yo‘q, birinchi marta topshiraman" },
    ] satisfies readonly OnboardingOption<PreviousExamOptionId>[],
  },
  "previous-result": {
    id: "previous-result",
    prompt: "Oxirgi natijangiz qaysi daraja edi?",
    instruction: singleChoiceInstruction,
    selection: "single",
    options: [
      ...certificateLevelOptions,
      { id: "not-certified", label: "Sertifikat ololmaganman" },
      { id: "cannot-remember", label: "Natijamni eslay olmayman" },
    ] satisfies readonly OnboardingOption<PreviousResultOptionId>[],
  },
  "target-level": {
    id: "target-level",
    prompt: "Qaysi darajaga erishishni maqsad qilgansiz?",
    instruction: singleChoiceInstruction,
    selection: "single",
    options: certificateLevelOptions,
  },
  "exam-time": {
    id: "exam-time",
    prompt: "Milliy sertifikat imtihonigacha qancha vaqtingiz bor?",
    instruction: singleChoiceInstruction,
    selection: "single",
    options: [
      { id: "less-than-one-month", label: "1 oydan kam" },
      { id: "one-to-two-months", label: "1-2 oy" },
      { id: "three-to-four-months", label: "3-4 oy" },
      { id: "five-months-or-more", label: "5 oy yoki undan ko‘p" },
      {
        id: "exam-date-not-selected",
        label: "Imtihon sanasini hali tanlamaganman",
      },
    ] satisfies readonly OnboardingOption<ExamTimeOptionId>[],
  },
  "weak-topics": {
    id: "weak-topics",
    prompt: "Qaysi mavzularda ko‘proq qiynalasiz?",
    instruction: "1–3 ta mavzuni tanlang",
    selection: "multiple",
    options: [
      { id: "phonetics", label: "Fonetika" },
      { id: "morphemics", label: "Morfemika" },
      { id: "stylistics", label: "Uslubiyat" },
      { id: "morphology", label: "Morfologiya" },
      { id: "syntax", label: "Sintaksis" },
      { id: "ghazal", label: "G‘azal" },
      { id: "scientific-text", label: "Ilmiy matn" },
      { id: "literary-text", label: "Badiiy matn" },
      { id: "essay-writing", label: "Esse yozish" },
      { id: "unknown", label: "Hozircha aniq bilmayman" },
    ] satisfies readonly OnboardingOption<WeakTopicOptionId>[],
  },
  "daily-time": {
    id: "daily-time",
    prompt: "Tayyorgarlik uchun kuniga qancha vaqt ajrata olasiz?",
    instruction: singleChoiceInstruction,
    selection: "single",
    options: [
      { id: "up-to-thirty-minutes", label: "30 daqiqagacha" },
      { id: "thirty-to-sixty-minutes", label: "30-60 daqiqa" },
      { id: "one-to-two-hours", label: "1-2 soat" },
      { id: "more-than-two-hours", label: "2 soatdan ko‘p" },
      { id: "cannot-study-daily", label: "Har kuni vaqt ajrata olmayman" },
    ] satisfies readonly OnboardingOption<DailyTimeOptionId>[],
  },
  "weekly-days": {
    id: "weekly-days",
    prompt: "Haftasiga necha kun tayyorlana olasiz?",
    instruction: singleChoiceInstruction,
    selection: "single",
    options: [
      { id: "one-to-two-days", label: "1-2 kun" },
      { id: "three-to-four-days", label: "3-4 kun" },
      { id: "five-to-six-days", label: "5-6 kun" },
      { id: "every-day", label: "Har kuni" },
    ] satisfies readonly OnboardingOption<WeeklyDaysOptionId>[],
  },
  "essay-level": {
    id: "essay-level",
    prompt: "Esse yozish bo‘yicha o‘zingizni qanday baholaysiz?",
    instruction: singleChoiceInstruction,
    selection: "single",
    options: [
      { id: "not-started", label: "Hali esse yozishni boshlamaganman" },
      {
        id: "knows-structure-struggles",
        label: "Tuzilmani bilaman, lekin yozishda qiynalaman",
      },
      {
        id: "can-write-many-errors",
        label: "Esse yoza olaman, ammo xatolarim ko‘p",
      },
      {
        id: "writes-well-wants-higher-score",
        label: "Yaxshi yozaman, ballimni oshirmoqchiman",
      },
      { id: "unknown", label: "Darajamni aniq bilmayman" },
    ] satisfies readonly OnboardingOption<EssayLevelOptionId>[],
  },
  "current-preparation": {
    id: "current-preparation",
    prompt: "Ona tili bo‘yicha hozirgi tayyorgarligingiz qanday?",
    instruction: singleChoiceInstruction,
    selection: "single",
    options: [
      {
        id: "start-from-zero",
        label: "Hammasini noldan boshlamoqchiman",
      },
      {
        id: "knows-some-basics",
        label: "Asosiy qoidalarni biroz bilaman",
      },
      {
        id: "studied-topics-struggles-with-tests",
        label: "Mavzularni o‘rganganman, lekin testlarda qiynalaman",
      },
      {
        id: "good-needs-systematic-plan",
        label: "Bilimim yaxshi, menga tizimli reja kerak",
      },
    ] satisfies readonly OnboardingOption<CurrentPreparationOptionId>[],
  },
};

export const onboardingQuestions = approvedQuestionOrder.map(
  (questionId) => questionsById[questionId],
);

export const returningChoice = {
  id: "returning-choice",
  prompt: "Keyingi qadamni tanlang",
  instruction: singleChoiceInstruction,
  options: [
    { id: "roadmap", label: "Shaxsiy yo‘l xaritasi" },
    { id: "mock", label: "Mock imtihon" },
  ] satisfies readonly OnboardingOption<ReturningChoiceOptionId>[],
} as const;

export const firstTimeComplete = {
  id: "first-time-complete",
  headline: "Dastlabki yo‘l xaritangiz tayyor!",
} as const;
