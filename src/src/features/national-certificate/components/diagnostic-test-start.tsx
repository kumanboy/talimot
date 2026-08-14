"use client";

import {
    useRouter,
} from "next/navigation";

import type {
    DiagnosticTestDefinition,
} from "@/features/national-certificate/model/diagnostic-test-types";

import {
    getNationalCollectionHref,
} from "@/features/tests/model/test-navigation";

import styles from "./diagnostic-test-start.module.css";

type DiagnosticTestStartProps = {
    readonly test:
        DiagnosticTestDefinition;
};

function BackIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="m15 5-7 7 7 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function QuestionsIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <rect
                x="5"
                y="3"
                width="14"
                height="18"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M9 8h6M9 12h6M9 16h3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
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

function ScoreIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M7 4h10v16H7z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path
                d="M10 8h4M10 12h4M10 16h2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function EssayIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M5 19h14M7 16l9-9 2 2-9 9H7v-2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="m5 12.5 4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M5 12h14m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function DiagnosticTestStart({
                                        test,
                                    }: DiagnosticTestStartProps) {
    const router =
        useRouter();

    const collectionsHref =
        getNationalCollectionHref(
            "diagnostika",
        );

    const testHref =
        `${collectionsHref}/${test.slug}/imtihon`;

    return (
        <main
            className={
                styles.page
            }
        >
            <div
                className={
                    styles.glow
                }
                aria-hidden="true"
            />

            <div
                className={
                    styles.content
                }
            >
                <header
                    className={
                        styles.topBar
                    }
                >
                    <button
                        type="button"
                        aria-label="Diagnostika testlariga qaytish"
                        onClick={() =>
                            router.replace(
                                collectionsHref,
                            )
                        }
                    >
                        <BackIcon />
                    </button>

                    <div>
                        <span>
                            Milliy sertifikat
                        </span>
                        <strong>
                            Diagnostika
                        </strong>
                    </div>
                </header>

                <section
                    className={
                        styles.hero
                    }
                >
                    <span
                        className={
                            styles.badge
                        }
                    >
                        TO‘LIQ IMTIHON
                    </span>

                    <h1>
                        {test.title}
                    </h1>

                    <p>
                        {test.description}
                    </p>
                </section>

                <section
                    className={
                        styles.stats
                    }
                >
                    <article>
                        <span>
                            <QuestionsIcon />
                        </span>
                        <div>
                            <strong>
                                {test.questionCount}
                            </strong>
                            <small>
                                ta savol
                            </small>
                        </div>
                    </article>

                    <article>
                        <span>
                            <ClockIcon />
                        </span>
                        <div>
                            <strong>
                                {test.estimatedMinutes}
                            </strong>
                            <small>
                                daqiqa
                            </small>
                        </div>
                    </article>

                    <article>
                        <span>
                            <ScoreIcon />
                        </span>
                        <div>
                            <strong>
                                {test.maximumScore}
                            </strong>
                            <small>
                                maksimal ball
                            </small>
                        </div>
                    </article>

                    <article>
                        <span>
                            <EssayIcon />
                        </span>
                        <div>
                            <strong>
                                1
                            </strong>
                            <small>
                                ta esse
                            </small>
                        </div>
                    </article>
                </section>

                <section
                    className={
                        styles.infoCard
                    }
                >
                    <h2>
                        Imtihon haqida
                    </h2>

                    <ul>
                        <li>
                            <CheckIcon />
                            <span>
                                Savollar milliy sertifikat formatida tuzilgan.
                            </span>
                        </li>

                        <li>
                            <CheckIcon />
                            <span>
                                Javoblar va qolgan vaqt avtomatik saqlanadi.
                            </span>
                        </li>

                        <li>
                            <CheckIcon />
                            <span>
                                Yopiq, moslashtirish va yozma topshiriqlar mavjud.
                            </span>
                        </li>

                        <li>
                            <CheckIcon />
                            <span>
                                Yakunda bo‘limlar kesimida batafsil tahlil beriladi.
                            </span>
                        </li>
                    </ul>
                </section>

                <section
                    className={
                        styles.warning
                    }
                >
                    Imtihonni boshlaganingizdan keyin 180 daqiqalik vaqt hisoblanadi. Barqaror internet va tinch muhitni oldindan tayyorlang.
                </section>

                <button
                    type="button"
                    className={
                        styles.startButton
                    }
                    onClick={() =>
                        router.push(
                            testHref,
                        )
                    }
                >
                    Imtihonni boshlash
                    <ArrowIcon />
                </button>
            </div>
        </main>
    );
}