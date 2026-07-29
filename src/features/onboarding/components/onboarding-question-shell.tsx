"use client";

import { useId, type CSSProperties, type ReactNode } from "react";

import { TalimotLogo } from "@/components/brand/talimot-logo";

import styles from "./onboarding-question-shell.module.css";

export type OnboardingQuestionShellProps = {
  stepLabel: string;
  progressPercentage: number;
  questionHeading: string;
  instruction: string;
  onBack: () => void;
  content: ReactNode;
  footerAction: ReactNode;
};

export function OnboardingQuestionShell({
  stepLabel,
  progressPercentage,
  questionHeading,
  instruction,
  onBack,
  content,
  footerAction,
}: OnboardingQuestionShellProps) {
  const headingId = useId();
  const instructionId = useId();
  const progress = Math.min(100, Math.max(0, progressPercentage));
  const progressStyle = {
    "--onboarding-progress": `${progress}%`,
  } as CSSProperties;

  return (
    <main className={styles.screen}>
      <div
        className={`${styles.decorativeShape} ${styles.topShape}`}
        aria-hidden="true"
      />
      <div
        className={`${styles.decorativeShape} ${styles.leftShape}`}
        aria-hidden="true"
      />
      <div
        className={`${styles.decorativeShape} ${styles.bottomShape}`}
        aria-hidden="true"
      />

      <div className={styles.shell}>
        <header className={styles.header}>
          <button
            className={styles.backButton}
            type="button"
            onClick={onBack}
            aria-label="Orqaga"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
            >
              <path
                d="M15 18 9 12l6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <TalimotLogo className={styles.logo} />
          <span className={styles.headerBalance} aria-hidden="true" />
        </header>

        <section
          className={styles.questionRegion}
          aria-labelledby={headingId}
          aria-describedby={instructionId}
        >
          <div className={styles.progressGroup}>
            <span className={styles.stepLabel}>{stepLabel}</span>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label={stepLabel}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              style={progressStyle}
            >
              <span className={styles.progressValue} />
            </div>
          </div>

          <div className={styles.questionCopy}>
            <h1 id={headingId}>{questionHeading}</h1>
            <p id={instructionId}>{instruction}</p>
          </div>

          <div className={styles.content}>{content}</div>
        </section>

        <footer className={styles.footer}>{footerAction}</footer>
      </div>
    </main>
  );
}
