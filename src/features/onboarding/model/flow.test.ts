import { describe, expect, it } from "vitest";

import {
  firstTimeComplete,
  onboardingQuestions,
  questionsById,
  returningChoice,
} from "./questions";
import {
  firstTimePath,
  getCompletionDestination,
  getNextStep,
  getPreviousStep,
  returningPath,
  validateAnswer,
  validateAnswers,
} from "./flow";
import type { OnboardingAnswers, OnboardingStepId } from "./types";

const returningAnswers = {
  category: "school-student",
  "subject-direction": "primary-subject",
  "previous-exam": "previously-taken",
  "previous-result": "b-plus",
  "target-level": "a-plus",
  "exam-time": "one-to-two-months",
  "weak-topics": ["phonetics", "morphemics", "stylistics"],
  "daily-time": "thirty-to-sixty-minutes",
  "weekly-days": "five-to-six-days",
  "essay-level": "can-write-many-errors",
  "returning-choice": "roadmap",
} as const satisfies OnboardingAnswers;

const firstTimeAnswers = {
  category: "applicant-or-university-student",
  "subject-direction": "mandatory-subject",
  "previous-exam": "first-time",
  "target-level": "a",
  "exam-time": "exam-date-not-selected",
  "weak-topics": ["unknown"],
  "daily-time": "cannot-study-daily",
  "weekly-days": "three-to-four-days",
  "essay-level": "not-started",
  "current-preparation": "start-from-zero",
} as const satisfies OnboardingAnswers;

function traverse(
  initialStep: OnboardingStepId,
  answers: OnboardingAnswers,
) {
  const visited: OnboardingStepId[] = [];
  let currentStep: OnboardingStepId | null = initialStep;

  while (currentStep) {
    visited.push(currentStep);
    currentStep = getNextStep(currentStep, answers);
  }

  return visited;
}

describe("approved onboarding paths", () => {
  it("traverses the complete returning path", () => {
    expect(traverse("category", returningAnswers)).toEqual(returningPath);
  });

  it("traverses the complete first-time path", () => {
    expect(traverse("category", firstTimeAnswers)).toEqual(firstTimePath);
  });

  it("routes previous exam takers through previous result", () => {
    expect(getNextStep("previous-exam", returningAnswers)).toBe(
      "previous-result",
    );
  });

  it("skips previous result for first-time users", () => {
    expect(getNextStep("previous-exam", firstTimeAnswers)).toBe(
      "target-level",
    );
  });

  it("preserves returning back navigation", () => {
    expect(getPreviousStep("target-level", returningAnswers)).toBe(
      "previous-result",
    );
    expect(getPreviousStep("returning-choice", returningAnswers)).toBe(
      "essay-level",
    );
  });

  it("preserves first-time back navigation", () => {
    expect(getPreviousStep("target-level", firstTimeAnswers)).toBe(
      "previous-exam",
    );
    expect(getPreviousStep("current-preparation", firstTimeAnswers)).toBe(
      "essay-level",
    );
    expect(getPreviousStep(firstTimeComplete.id, firstTimeAnswers)).toBe(
      "current-preparation",
    );
  });

  it("maps approved completion actions to frozen routes", () => {
    expect(
      getCompletionDestination("returning-choice", returningAnswers),
    ).toBe("/diagnostika");
    expect(
      getCompletionDestination("returning-choice", {
        ...returningAnswers,
        "returning-choice": "mock",
      }),
    ).toBe("/tests");
    expect(
      getCompletionDestination("first-time-complete", firstTimeAnswers),
    ).toBe("/yol-xaritasi");
    expect(
      getCompletionDestination(
        "first-time-complete",
        firstTimeAnswers,
        "diagnostic",
      ),
    ).toBe("/diagnostika");
  });
});

describe("branch validation", () => {
  it("rejects previous-result answers outside the returning branch", () => {
    expect(
      validateAnswer("previous-result", "a-plus", firstTimeAnswers),
    ).toMatchObject({ valid: false, code: "step-unavailable" });
  });

  it("rejects current-preparation answers outside the first-time branch", () => {
    expect(
      validateAnswer(
        "current-preparation",
        "start-from-zero",
        returningAnswers,
      ),
    ).toMatchObject({ valid: false, code: "step-unavailable" });
  });

  it("rejects injected branch answers in an answer collection", () => {
    expect(
      validateAnswers({
        ...firstTimeAnswers,
        "previous-result": "a-plus",
      }),
    ).toMatchObject({ valid: false, code: "step-unavailable" });

    expect(
      validateAnswers({
        ...returningAnswers,
        "current-preparation": "start-from-zero",
      }),
    ).toMatchObject({ valid: false, code: "step-unavailable" });
  });

  it("rejects a manipulated step identifier", () => {
    expect(
      validateAnswers({
        ...firstTimeAnswers,
        "administrator-only-step": "injected",
      }),
    ).toMatchObject({ valid: false, code: "unknown-step" });
  });
});

describe("answer validation", () => {
  it("requires exactly one value for single-choice questions", () => {
    expect(
      validateAnswer("category", [], returningAnswers),
    ).toMatchObject({ valid: false, code: "exactly-one" });
    expect(
      validateAnswer("category", undefined, returningAnswers),
    ).toMatchObject({ valid: false, code: "required" });
  });

  it("accepts the weak-topic minimum", () => {
    expect(
      validateAnswer("weak-topics", ["phonetics"], returningAnswers),
    ).toEqual({ valid: true });
  });

  it("accepts the weak-topic maximum", () => {
    expect(
      validateAnswer(
        "weak-topics",
        ["phonetics", "morphemics", "stylistics"],
        returningAnswers,
      ),
    ).toEqual({ valid: true });
  });

  it("rejects an empty weak-topic selection", () => {
    expect(
      validateAnswer("weak-topics", [], returningAnswers),
    ).toMatchObject({ valid: false, code: "too-few" });
  });

  it("rejects more than three weak topics", () => {
    expect(
      validateAnswer(
        "weak-topics",
        ["phonetics", "morphemics", "stylistics", "morphology"],
        returningAnswers,
      ),
    ).toMatchObject({ valid: false, code: "too-many" });
  });

  it("accepts the exclusive unknown weak-topic option by itself", () => {
    expect(
      validateAnswer("weak-topics", ["unknown"], returningAnswers),
    ).toEqual({ valid: true });
  });

  it("rejects unknown combined with another weak topic", () => {
    expect(
      validateAnswer(
        "weak-topics",
        ["unknown", "phonetics"],
        returningAnswers,
      ),
    ).toMatchObject({ valid: false, code: "exclusive-option" });
  });

  it("rejects unknown or manipulated option IDs", () => {
    expect(
      validateAnswer("category", "administrator", returningAnswers),
    ).toMatchObject({ valid: false, code: "unapproved-option" });
    expect(
      validateAnswer(
        "weak-topics",
        ["phonetics", "injected-topic"],
        returningAnswers,
      ),
    ).toMatchObject({ valid: false, code: "unapproved-option" });
  });

  it("rejects duplicate weak-topic IDs", () => {
    expect(
      validateAnswer(
        "weak-topics",
        ["phonetics", "phonetics"],
        returningAnswers,
      ),
    ).toMatchObject({ valid: false, code: "duplicate-option" });
  });
});

describe("approved question contract", () => {
  it("keeps the exact approved question order and count", () => {
    expect(onboardingQuestions.map((question) => question.id)).toEqual([
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
    ]);
    expect(onboardingQuestions).toHaveLength(11);
  });

  it("keeps the exact approved prompts", () => {
    expect(onboardingQuestions.map((question) => question.prompt)).toEqual([
      "Siz qaysi toifaga kirasiz?",
      "Milliy sertifikat sizga qaysi yo‘nalish uchun kerak?",
      "Milliy sertifikat imtihonini avval topshirganmisiz?",
      "Oxirgi natijangiz qaysi daraja edi?",
      "Qaysi darajaga erishishni maqsad qilgansiz?",
      "Milliy sertifikat imtihonigacha qancha vaqtingiz bor?",
      "Qaysi mavzularda ko‘proq qiynalasiz?",
      "Tayyorgarlik uchun kuniga qancha vaqt ajrata olasiz?",
      "Haftasiga necha kun tayyorlana olasiz?",
      "Esse yozish bo‘yicha o‘zingizni qanday baholaysiz?",
      "Ona tili bo‘yicha hozirgi tayyorgarligingiz qanday?",
    ]);
  });

  it("keeps exact option counts and approved labels", () => {
    expect(
      onboardingQuestions.map((question) => question.options.length),
    ).toEqual([3, 2, 2, 8, 6, 5, 10, 5, 4, 5, 4]);

    expect(
      questionsById["weak-topics"].options.map((option) => option.label),
    ).toEqual([
      "Fonetika",
      "Morfemika",
      "Uslubiyat",
      "Morfologiya",
      "Sintaksis",
      "G‘azal",
      "Ilmiy matn",
      "Badiiy matn",
      "Esse yozish",
      "Hozircha aniq bilmayman",
    ]);

    expect(returningChoice.options.map((option) => option.label)).toEqual([
      "Shaxsiy yo‘l xaritasi",
      "Mock imtihon",
    ]);
  });
});
