export const onboardingStepIds = [
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
  "returning-choice",
  "first-time-complete",
] as const;

export type OnboardingStepId = (typeof onboardingStepIds)[number];

export type OnboardingQuestionId = Exclude<
  OnboardingStepId,
  "returning-choice" | "first-time-complete"
>;

export type CategoryOptionId =
  | "school-student"
  | "applicant-or-university-student"
  | "native-language-teacher";

export type SubjectDirectionOptionId =
  | "primary-subject"
  | "mandatory-subject";

export type PreviousExamOptionId = "previously-taken" | "first-time";

export type CertificateLevelOptionId =
  | "a-plus"
  | "a"
  | "b-plus"
  | "b"
  | "c-plus"
  | "c";

export type PreviousResultOptionId =
  | CertificateLevelOptionId
  | "not-certified"
  | "cannot-remember";

export type ExamTimeOptionId =
  | "less-than-one-month"
  | "one-to-two-months"
  | "three-to-four-months"
  | "five-months-or-more"
  | "exam-date-not-selected";

export type WeakTopicOptionId =
  | "phonetics"
  | "morphemics"
  | "stylistics"
  | "morphology"
  | "syntax"
  | "ghazal"
  | "scientific-text"
  | "literary-text"
  | "essay-writing"
  | "unknown";

export type DailyTimeOptionId =
  | "up-to-thirty-minutes"
  | "thirty-to-sixty-minutes"
  | "one-to-two-hours"
  | "more-than-two-hours"
  | "cannot-study-daily";

export type WeeklyDaysOptionId =
  | "one-to-two-days"
  | "three-to-four-days"
  | "five-to-six-days"
  | "every-day";

export type EssayLevelOptionId =
  | "not-started"
  | "knows-structure-struggles"
  | "can-write-many-errors"
  | "writes-well-wants-higher-score"
  | "unknown";

export type CurrentPreparationOptionId =
  | "start-from-zero"
  | "knows-some-basics"
  | "studied-topics-struggles-with-tests"
  | "good-needs-systematic-plan";

export type ReturningChoiceOptionId = "roadmap" | "mock";

export interface AnswerValueByStep {
  category: CategoryOptionId;
  "subject-direction": SubjectDirectionOptionId;
  "previous-exam": PreviousExamOptionId;
  "previous-result": PreviousResultOptionId;
  "target-level": CertificateLevelOptionId;
  "exam-time": ExamTimeOptionId;
  "weak-topics": readonly WeakTopicOptionId[];
  "daily-time": DailyTimeOptionId;
  "weekly-days": WeeklyDaysOptionId;
  "essay-level": EssayLevelOptionId;
  "current-preparation": CurrentPreparationOptionId;
  "returning-choice": ReturningChoiceOptionId;
}

export type AnswerableOnboardingStepId = keyof AnswerValueByStep;

export type OnboardingAnswers = Partial<{
  [StepId in AnswerableOnboardingStepId]: AnswerValueByStep[StepId];
}>;

export interface OnboardingOption<OptionId extends string = string> {
  readonly id: OptionId;
  readonly label: string;
}

export interface OnboardingQuestionDefinition {
  readonly id: OnboardingQuestionId;
  readonly prompt: string;
  readonly instruction: string;
  readonly selection: "single" | "multiple";
  readonly options: readonly OnboardingOption[];
}

export type ValidationErrorCode =
  | "required"
  | "exactly-one"
  | "too-few"
  | "too-many"
  | "duplicate-option"
  | "exclusive-option"
  | "unapproved-option"
  | "step-unavailable"
  | "unknown-step";

export type ValidationResult =
  | { readonly valid: true }
  | {
      readonly valid: false;
      readonly code: ValidationErrorCode;
      readonly message: string;
    };

export type OnboardingDestination =
    | "/yol-xaritasi?mode=from-zero&view=full"
    | "/yol-xaritasi?mode=boost&view=full"
    | "/diagnostika"
    | "/tests";