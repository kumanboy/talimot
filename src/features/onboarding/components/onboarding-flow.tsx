"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { OnboardingWelcome } from "@/components/onboarding/onboarding-welcome";
import {
  getActivePath,
  getCompletionDestination,
  getNextStep,
  getPreviousStep,
  validateAnswer,
} from "@/features/onboarding/model/flow";
import {
  firstTimeComplete,
  questionsById,
  returningChoice,
} from "@/features/onboarding/model/questions";
import type {
  AnswerableOnboardingStepId,
  OnboardingAnswers,
  OnboardingQuestionId,
  OnboardingStepId,
  ReturningChoiceOptionId,
  WeakTopicOptionId,
} from "@/features/onboarding/model/types";

import { MultiSelectCard } from "./multi-select-card";
import { OnboardingActionButton } from "./onboarding-action-button";
import { OnboardingQuestionShell } from "./onboarding-question-shell";
import { PathChoiceCard } from "./path-choice-card";
import { SingleChoiceCard } from "./single-choice-card";
import styles from "./onboarding-flow.module.css";

type FlowScreen = "welcome" | OnboardingStepId;

const totalDisplayedQuestions = 10;

const returningChoiceDetails = {
  roadmap:
    "15 ta bepul diagnostik savol orqali kuchli va zaif mavzularingizni aniqlang.",
  mock: "To‘liq mock imtihon orqali hozirgi natijangizni sinab ko‘ring.",
} as const satisfies Record<ReturningChoiceOptionId, string>;

const firstTimeSummaryItems = [
  "Maqsadingiz va imtihongacha qolgan vaqt",
  "Siz tanlagan qiyin mavzular",
  "Kunlik va haftalik tayyorgarlik imkoniyatingiz",
  "Esse yozish bo‘yicha hozirgi holatingiz",
] as const;

function isQuestionStep(
  stepId: OnboardingStepId,
): stepId is OnboardingQuestionId {
  return stepId in questionsById;
}

function pruneInactiveBranchAnswers(
  answers: OnboardingAnswers,
): OnboardingAnswers {
  const activeSteps = new Set(getActivePath(answers));

  return Object.fromEntries(
    Object.entries(answers).filter(([stepId]) =>
      activeSteps.has(stepId as OnboardingStepId),
    ),
  ) as OnboardingAnswers;
}

function isGridQuestion(stepId: OnboardingQuestionId) {
  return (
    stepId === "previous-result" ||
    stepId === "target-level" ||
    stepId === "exam-time" ||
    stepId === "weak-topics" ||
    stepId === "weekly-days"
  );
}

function isFullWidthGridOption(
  stepId: OnboardingQuestionId,
  optionIndex: number,
) {
  if (stepId === "previous-result") {
    return optionIndex >= 6;
  }

  if (stepId === "exam-time") {
    return optionIndex === 4;
  }

  if (stepId === "weak-topics") {
    return optionIndex >= 8;
  }

  return false;
}

export function OnboardingFlow() {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [screen, setScreen] = useState<FlowScreen>("welcome");
  const [hasStarted, setHasStarted] = useState(false);
  // TODO(onboarding-persistence): Replace this in-memory boundary with
  // authenticated, server-backed persistence in its approved implementation task.
  const [answers, setAnswers] = useState<OnboardingAnswers>({});

  useEffect(() => {
    if (screen !== "welcome") {
      headingRef.current?.focus();
    }
  }, [screen]);

  if (screen === "welcome") {
    return (
      <OnboardingWelcome
        showReadyState={hasStarted}
        onStart={() => {
          setHasStarted(true);
          setScreen("category");
        }}
      />
    );
  }

  const activePath = getActivePath(answers);
  const activeIndex = activePath.indexOf(screen);
  const isCompleteScreen =
    screen === "returning-choice" || screen === "first-time-complete";
  const displayedStep = isCompleteScreen
    ? totalDisplayedQuestions
    : activeIndex + 1;
  const stepLabel = isCompleteScreen ? "Tayyor" : `${displayedStep}-qadam`;
  const progressPercentage = isCompleteScreen
    ? 100
    : (displayedStep / totalDisplayedQuestions) * 100;

  const updateSingleAnswer = (
    stepId: AnswerableOnboardingStepId,
    value: string,
  ) => {
    setAnswers((currentAnswers) =>
      pruneInactiveBranchAnswers({
        ...currentAnswers,
        [stepId]: value,
      } as OnboardingAnswers),
    );
  };

  const updateWeakTopic = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const optionId = event.currentTarget.value as WeakTopicOptionId;
    const isChecked = event.currentTarget.checked;

    setAnswers((currentAnswers) => {
      const currentSelection = [
        ...(currentAnswers["weak-topics"] ?? []),
      ];

      if (!isChecked) {
        return {
          ...currentAnswers,
          "weak-topics": currentSelection.filter(
            (selectedId) => selectedId !== optionId,
          ),
        };
      }

      if (optionId === "unknown") {
        return { ...currentAnswers, "weak-topics": ["unknown"] };
      }

      const knownSelection = currentSelection.filter(
        (selectedId) => selectedId !== "unknown",
      );

      if (knownSelection.length >= 3) {
        return currentAnswers;
      }

      return {
        ...currentAnswers,
        "weak-topics": [...knownSelection, optionId],
      };
    });
  };

  const goBack = () => {
    const previousStep = getPreviousStep(screen, answers);

    if (previousStep) {
      setScreen(previousStep);
      return;
    }

    setScreen("welcome");
  };

  const goForward = () => {
    if (screen === "returning-choice") {
      router.push(getCompletionDestination(screen, answers));
      return;
    }

    const nextStep = getNextStep(screen, answers);

    if (nextStep) {
      setScreen(nextStep);
    }
  };

  if (screen === "first-time-complete") {
    return (
      <OnboardingQuestionShell
        stepLabel={stepLabel}
        progressPercentage={progressPercentage}
        questionHeading={firstTimeComplete.headline}
        instruction="Javoblaringiz asosida siz uchun boshlang‘ich tayyorgarlik rejasi tuzildi."
        onBack={goBack}
        headingRef={headingRef}
        content={
          <div
            key={screen}
            className={`${styles.stepContent} ${styles.completionContent}`}
          >
            <section className={styles.summaryCard}>
              <span className={styles.summaryBadge}>
                Dastlabki tavsiya
              </span>
              <h2>Yo‘l xaritangiz quyidagilarni hisobga oladi:</h2>
              <ol>
                {firstTimeSummaryItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>
            <p className={styles.informationText}>
              Aniqroq tavsiya olish uchun 15 savollik bepul diagnostikani ham
              ishlashingiz mumkin.
            </p>
          </div>
        }
        footerAction={
          <div className={styles.completionActions}>
            <OnboardingActionButton
              onClick={() =>
                router.push(
                  getCompletionDestination(
                    "first-time-complete",
                    answers,
                  ),
                )
              }
            >
              Yo‘l xaritasini ko‘rish
            </OnboardingActionButton>
            <OnboardingActionButton
              className={styles.secondaryAction}
              onClick={() =>
                router.push(
                  getCompletionDestination(
                    "first-time-complete",
                    answers,
                    "diagnostic",
                  ),
                )
              }
            >
              Diagnostikani boshlash
            </OnboardingActionButton>
          </div>
        }
      />
    );
  }

  if (screen === "returning-choice") {
    const selectedChoice = answers["returning-choice"];
    const isValid = validateAnswer(
      "returning-choice",
      selectedChoice,
      answers,
    ).valid;

    return (
      <OnboardingQuestionShell
        stepLabel={stepLabel}
        progressPercentage={progressPercentage}
        questionHeading={returningChoice.prompt}
        instruction="Natijangizga mos tayyorgarlikni boshlashingiz mumkin."
        onBack={goBack}
        headingRef={headingRef}
        content={
          <div
            key={screen}
            className={`${styles.stepContent} ${styles.pathChoices}`}
          >
            {returningChoice.options.map((option) => (
              <PathChoiceCard
                key={option.id}
                title={option.label}
                description={returningChoiceDetails[option.id]}
                badge={
                  option.id === "roadmap"
                    ? "Tavsiya etiladi"
                    : undefined
                }
                name="onboarding-returning-choice"
                value={option.id}
                checked={selectedChoice === option.id}
                onChange={(event) =>
                  updateSingleAnswer(
                    "returning-choice",
                    event.currentTarget.value,
                  )
                }
              />
            ))}
          </div>
        }
        footerAction={
          <OnboardingActionButton
            disabled={!isValid}
            onClick={goForward}
          >
            Davom etish
          </OnboardingActionButton>
        }
      />
    );
  }

  if (!isQuestionStep(screen)) {
    return null;
  }

  const question = questionsById[screen];
  const answer = answers[screen];
  const isValid = validateAnswer(screen, answer, answers).valid;
  const weakTopics = answers["weak-topics"] ?? [];
  const isAtWeakTopicMaximum = weakTopics.length === 3;
  const optionsClasses = [
    styles.options,
    isGridQuestion(screen) ? styles.optionGrid : styles.optionList,
  ].join(" ");

  return (
    <OnboardingQuestionShell
      stepLabel={stepLabel}
      progressPercentage={progressPercentage}
      questionHeading={question.prompt}
      instruction={question.instruction}
      onBack={goBack}
      headingRef={headingRef}
      content={
        <div key={screen} className={styles.stepContent}>
          {screen === "weak-topics" ? (
            <div className={styles.selectionCounter} aria-live="polite">
              {weakTopics.length}/3
            </div>
          ) : null}

          <div className={optionsClasses}>
            {question.options.map((option, optionIndex) => {
              const optionClassName = isFullWidthGridOption(
                screen,
                optionIndex,
              )
                ? styles.fullWidthOption
                : undefined;

              if (question.selection === "multiple") {
                const checked = weakTopics.includes(
                  option.id as WeakTopicOptionId,
                );
                const disabled = isAtWeakTopicMaximum && !checked;

                return (
                  <MultiSelectCard
                    key={option.id}
                    className={optionClassName}
                    name="onboarding-weak-topics"
                    label={option.label}
                    value={option.id}
                    checked={checked}
                    disabled={disabled}
                    onChange={updateWeakTopic}
                  />
                );
              }

              return (
                <SingleChoiceCard
                  key={option.id}
                  className={optionClassName}
                  name={`onboarding-${question.id}`}
                  label={option.label}
                  value={option.id}
                  checked={answer === option.id}
                  onChange={(event) =>
                    updateSingleAnswer(
                      question.id,
                      event.currentTarget.value,
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      }
      footerAction={
        <OnboardingActionButton
          disabled={!isValid}
          onClick={goForward}
        >
          {screen === "current-preparation"
            ? "Natijani ko‘rish"
            : "Davom etish"}
        </OnboardingActionButton>
      }
    />
  );
}
