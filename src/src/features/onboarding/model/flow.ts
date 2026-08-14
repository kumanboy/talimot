import {
  firstTimeComplete,
  questionsById,
  returningChoice,
} from "./questions";
import type { RoadmapMode } from "@/features/roadmap/model/types";

import type {
  AnswerableOnboardingStepId,
  OnboardingAnswers,
  OnboardingDestination,
  OnboardingStepId,
  ValidationErrorCode,
  ValidationResult,
} from "./types";

export const returningPath = [
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
  "returning-choice",
] as const satisfies readonly OnboardingStepId[];

export const firstTimePath = [
  "category",
  "subject-direction",
  "previous-exam",
  "target-level",
  "exam-time",
  "weak-topics",
  "daily-time",
  "weekly-days",
  "essay-level",
  "current-preparation",
  "first-time-complete",
] as const satisfies readonly OnboardingStepId[];

const preBranchPath = [
  "category",
  "subject-direction",
  "previous-exam",
] as const satisfies readonly OnboardingStepId[];

const answerableStepIds = new Set<OnboardingStepId>([
  ...Object.keys(questionsById),
  returningChoice.id,
] as OnboardingStepId[]);

function invalid(
    code: ValidationErrorCode,
    message: string,
): ValidationResult {
  return { valid: false, code, message };
}

function isApprovedOption(
    stepId: AnswerableOnboardingStepId,
    value: string,
) {
  const options =
      stepId === returningChoice.id
          ? returningChoice.options
          : questionsById[stepId].options;

  return options.some((option) => option.id === value);
}

function createRegistrationDestination(
    destination: OnboardingDestination,
    roadmapMode: RoadmapMode,
): string {
  const searchParams = new URLSearchParams({
    next: destination,
    roadmapMode,
  });

  return `/auth/register?${searchParams.toString()}`;
}

export function getActivePath(
    answers: OnboardingAnswers,
): readonly OnboardingStepId[] {
  if (answers["previous-exam"] === "previously-taken") {
    return returningPath;
  }

  if (answers["previous-exam"] === "first-time") {
    return firstTimePath;
  }

  return preBranchPath;
}

export function isStepAvailable(
    stepId: OnboardingStepId,
    answers: OnboardingAnswers,
) {
  return getActivePath(answers).includes(stepId);
}

export function validateAnswer(
    stepId: AnswerableOnboardingStepId,
    value: unknown,
    answers: OnboardingAnswers,
): ValidationResult {
  if (!isStepAvailable(stepId, answers)) {
    return invalid(
        "step-unavailable",
        `The ${stepId} step is not available in the active onboarding branch.`,
    );
  }

  if (stepId === "weak-topics") {
    if (!Array.isArray(value)) {
      return invalid(
          "exactly-one",
          "Weak topics must be submitted as a selection list.",
      );
    }

    if (value.length === 0) {
      return invalid(
          "too-few",
          "Select at least one weak topic.",
      );
    }

    if (value.length > 3) {
      return invalid(
          "too-many",
          "Select no more than three weak topics.",
      );
    }

    if (
        value.some(
            (optionId) => typeof optionId !== "string",
        )
    ) {
      return invalid(
          "unapproved-option",
          "Weak-topic selections must use approved option IDs.",
      );
    }

    if (new Set(value).size !== value.length) {
      return invalid(
          "duplicate-option",
          "A weak topic cannot be selected more than once.",
      );
    }

    if (
        value.some(
            (optionId) =>
                !isApprovedOption(
                    "weak-topics",
                    optionId as string,
                ),
        )
    ) {
      return invalid(
          "unapproved-option",
          "One or more weak-topic option IDs are not approved.",
      );
    }

    if (
        value.includes("unknown") &&
        value.length !== 1
    ) {
      return invalid(
          "exclusive-option",
          "The unknown weak-topic option must be selected by itself.",
      );
    }

    return { valid: true };
  }

  if (
      value === undefined ||
      value === null ||
      value === ""
  ) {
    return invalid(
        "required",
        "Select one approved option.",
    );
  }

  if (typeof value !== "string") {
    return invalid(
        "exactly-one",
        "Single-choice questions require exactly one option.",
    );
  }

  if (!isApprovedOption(stepId, value)) {
    return invalid(
        "unapproved-option",
        `The option ID is not approved for ${stepId}.`,
    );
  }

  return { valid: true };
}

export function validateAnswers(
    input: Readonly<Record<string, unknown>>,
): ValidationResult {
  const answers = input as OnboardingAnswers;

  for (const [rawStepId, value] of Object.entries(input)) {
    if (
        !answerableStepIds.has(
            rawStepId as OnboardingStepId,
        )
    ) {
      return invalid(
          "unknown-step",
          `The onboarding step ID ${rawStepId} is not approved.`,
      );
    }

    const result = validateAnswer(
        rawStepId as AnswerableOnboardingStepId,
        value,
        answers,
    );

    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

export class OnboardingFlowError extends Error {
  constructor(
      readonly code: ValidationErrorCode,
      message: string,
  ) {
    super(message);
    this.name = "OnboardingFlowError";
  }
}

function assertCurrentAnswer(
    stepId: AnswerableOnboardingStepId,
    answers: OnboardingAnswers,
) {
  const result = validateAnswer(
      stepId,
      answers[stepId],
      answers,
  );

  if (!result.valid) {
    throw new OnboardingFlowError(
        result.code,
        result.message,
    );
  }
}

export function getNextStep(
    currentStepId: OnboardingStepId,
    answers: OnboardingAnswers,
): OnboardingStepId | null {
  const activePath = getActivePath(answers);
  const currentIndex =
      activePath.indexOf(currentStepId);

  if (currentIndex === -1) {
    throw new OnboardingFlowError(
        "step-unavailable",
        `The ${currentStepId} step is not available in the active branch.`,
    );
  }

  if (currentStepId === firstTimeComplete.id) {
    return null;
  }

  assertCurrentAnswer(
      currentStepId as AnswerableOnboardingStepId,
      answers,
  );

  return activePath[currentIndex + 1] ?? null;
}

export function getPreviousStep(
    currentStepId: OnboardingStepId,
    answers: OnboardingAnswers,
): OnboardingStepId | null {
  const activePath = getActivePath(answers);
  const currentIndex =
      activePath.indexOf(currentStepId);

  if (currentIndex === -1) {
    throw new OnboardingFlowError(
        "step-unavailable",
        `The ${currentStepId} step is not available in the active branch.`,
    );
  }

  return activePath[currentIndex - 1] ?? null;
}

export function getCompletionDestination(
    stepId:
        | "returning-choice"
        | "first-time-complete",
    answers: OnboardingAnswers,
    firstTimeAction:
        | "primary"
        | "diagnostic" = "primary",
): string {
  if (stepId === "first-time-complete") {
    if (!isStepAvailable(stepId, answers)) {
      throw new OnboardingFlowError(
          "step-unavailable",
          "First-time completion is unavailable in the returning branch.",
      );
    }

    const destination: OnboardingDestination =
        firstTimeAction === "diagnostic"
            ? "/diagnostika"
            : "/yol-xaritasi?mode=from-zero&view=full";

    return createRegistrationDestination(destination, "from-zero");
  }

  assertCurrentAnswer(stepId, answers);

  const destination: OnboardingDestination =
      answers[stepId] === "roadmap"
          ? "/yol-xaritasi?mode=boost&view=full"
          : "/tests";

  return createRegistrationDestination(destination, "boost");
}