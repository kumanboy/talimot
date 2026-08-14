"use client";

import { TalimotLogo } from "@/components/brand/talimot-logo";

import styles from "./onboarding-welcome.module.css";

type OnboardingWelcomeProps = {
  onStart: () => void;
  showReadyState?: boolean;
};

export function OnboardingWelcome({
  onStart,
  showReadyState = false,
}: OnboardingWelcomeProps) {
  const screenClasses = [
    styles.screen,
    showReadyState ? styles.ready : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={screenClasses}>
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

      <div className={styles.content}>
        <div className={styles.logoSlot}>
          <TalimotLogo
            className={`${styles.motionItem} ${styles.logoMotion}`}
          />
        </div>

        <section
          className={`${styles.copy} ${styles.motionItem} ${styles.copyMotion}`}
          aria-labelledby="onboarding-welcome-title"
        >
          <h1 id="onboarding-welcome-title">Xush kelibsiz!</h1>
          <p className={styles.promise}>
            Biz bilan A+ darajaga erishing!
          </p>
          <p className={styles.description}>
            Milliy sertifikat sari ishonchli yo‘lingizni birgalikda boshlashga
            tayyormisiz?
          </p>
        </section>

        <div className={styles.buttonSlot}>
          <button
            className={`${styles.startButton} ${styles.motionItem} ${styles.buttonMotion}`}
            type="button"
            onClick={onStart}
          >
            Boshlash
          </button>
        </div>
      </div>
    </main>
  );
}
