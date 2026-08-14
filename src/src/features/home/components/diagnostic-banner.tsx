"use client";

import { useRouter } from "next/navigation";

import styles from "./diagnostic-banner.module.css";

const diagnosticStats = [
    {
        value: "45",
        label: "savol",
        icon: "questions",
    },
    {
        value: "180",
        label: "daqiqa",
        icon: "time",
    },
    {
        value: "100%",
        label: "tahlil",
        icon: "analysis",
    },
] as const;

type DiagnosticIcon =
    (typeof diagnosticStats)[number]["icon"];

function StatIcon({
                      type,
                  }: {
    type: DiagnosticIcon;
}) {
    if (type === "questions") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M6 4h12v16H6V4Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />

                <path
                    d="M9 8h6M9 12h6M9 16h4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (type === "time") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />

                <path
                    d="M12 7v5l3 2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M5 18V9M10 18V5M15 18v-7M20 18V7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />

            <path
                d="m5 7 4-3 5 4 5-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function DiagnosticBanner() {
    const router = useRouter();

    return (
        <section
            className={styles.banner}
            aria-labelledby="diagnostic-title"
        >
            <div
                className={styles.backgroundGlow}
                aria-hidden="true"
            />

            <header className={styles.header}>
        <span className={styles.badge}>
          <span
              className={styles.badgeIcon}
              aria-hidden="true"
          >
            ✓
          </span>

          BEPUL DIAGNOSTIKA TESTI
        </span>

                <span className={styles.freeLabel}>
          100% bepul
        </span>
            </header>

            <div className={styles.hero}>
                <div className={styles.copy}>
                    <h2 id="diagnostic-title">
                        Imtihonga tayyorligingizni diagnostika
                        testi orqali tekshiring
                    </h2>

                    <p>
                        Milliy sertifikat formatidagi savollar,
                        vaqt nazorati va natijalar tahlili.
                    </p>
                </div>

                <div
                    className={styles.illustration}
                    aria-hidden="true"
                >
                    <div className={styles.progressRing}>
                        <span>45</span>
                        <small>SAVOL</small>
                    </div>

                    <div className={styles.resultCard}>
            <span className={styles.resultTitle}>
              NATIJA
            </span>

                        <div className={styles.resultBars}>
                            <span />
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.stats}>
                {diagnosticStats.map((stat) => (
                    <div
                        key={stat.label}
                        className={styles.statCard}
                    >
            <span className={styles.statIcon}>
              <StatIcon type={stat.icon} />
            </span>

                        <strong>{stat.value}</strong>
                        <small>{stat.label}</small>
                    </div>
                ))}
            </div>

            <div className={styles.information}>
        <span
            className={styles.informationIcon}
            aria-hidden="true"
        >
          i
        </span>

                <p>
                    Test yakunida natijangiz va
                    xatolaringiz bo‘yicha batafsil tahlil
                    olasiz.
                </p>
            </div>

            <button
                className={styles.actionButton}
                type="button"
                onClick={() =>
                    router.push("/tests/milliy-sertifikat/diagnostika")
                }
            >
        <span>
          Bepul diagnostika testini boshlash
        </span>

                <span
                    className={styles.actionIcon}
                    aria-hidden="true"
                >
          →
        </span>
            </button>
        </section>
    );
}