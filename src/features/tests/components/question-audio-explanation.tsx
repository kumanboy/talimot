"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    DEFAULT_AUDIO_EXPLANATION_TITLE,
    hasQuestionAudioExplanation,
} from "@/features/tests/model/question-explanation";

import type {
    QuestionExplanation,
} from "@/features/tests/model/question-explanation";

import styles from "./question-audio-explanation.module.css";

type QuestionAudioExplanationProps = {
    readonly explanation?:
        QuestionExplanation;
    readonly visible?: boolean;
};

function PlayIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="m9 7 8 5-8 5V7Z"
                fill="currentColor"
            />
        </svg>
    );
}

function PauseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M9 7v10M15 7v10"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
            />
        </svg>
    );
}

function HeadphonesIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M5 13v-1a7 7 0 0 1 14 0v1"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />

            <path
                d="M5 13h2.5v6H6.7A1.7 1.7 0 0 1 5 17.3V13ZM19 13h-2.5v6h.8a1.7 1.7 0 0 0 1.7-1.7V13Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function formatAudioTime(
    totalSeconds: number,
): string {
    if (
        !Number.isFinite(
            totalSeconds,
        ) ||
        totalSeconds < 0
    ) {
        return "00:00";
    }

    const roundedSeconds =
        Math.floor(
            totalSeconds,
        );

    const minutes =
        Math.floor(
            roundedSeconds / 60,
        );

    const seconds =
        roundedSeconds % 60;

    return `${String(
        minutes,
    ).padStart(
        2,
        "0",
    )}:${String(
        seconds,
    ).padStart(
        2,
        "0",
    )}`;
}

function pauseOtherExplanationAudios(
    currentAudio:
    HTMLAudioElement,
) {
    const audioElements =
        document.querySelectorAll<HTMLAudioElement>(
            'audio[data-question-explanation-audio="true"]',
        );

    audioElements.forEach(
        (
            audioElement,
        ) => {
            if (
                audioElement !==
                currentAudio &&
                !audioElement.paused
            ) {
                audioElement.pause();
            }
        },
    );
}

export function QuestionAudioExplanation({
                                             explanation,
                                             visible = true,
                                         }: QuestionAudioExplanationProps) {
    const audioRef =
        useRef<HTMLAudioElement | null>(
            null,
        );

    const [
        isPlaying,
        setIsPlaying,
    ] = useState(
        false,
    );

    const [
        currentTime,
        setCurrentTime,
    ] = useState(
        0,
    );

    const [
        duration,
        setDuration,
    ] = useState(
        0,
    );

    const [
        hasError,
        setHasError,
    ] = useState(
        false,
    );

    const [
        hasEnded,
        setHasEnded,
    ] = useState(
        false,
    );

    const audio =
        explanation?.audio;

    const title =
        audio?.title?.trim() ||
        DEFAULT_AUDIO_EXPLANATION_TITLE;

    const durationText =
        useMemo(
            () =>
                duration > 0
                    ? formatAudioTime(
                        duration,
                    )
                    : audio?.durationLabel ??
                    "00:00",
            [
                audio?.durationLabel,
                duration,
            ],
        );

    useEffect(
        () => {
            const element =
                audioRef.current;

            if (element) {
                element.pause();
                element.currentTime =
                    0;
            }

            setIsPlaying(
                false,
            );
            setCurrentTime(
                0,
            );
            setDuration(
                0,
            );
            setHasError(
                false,
            );
            setHasEnded(
                false,
            );
        },
        [
            audio?.src,
        ],
    );

    useEffect(
        () => {
            return () => {
                audioRef.current?.pause();
            };
        },
        [],
    );

    if (
        !visible ||
        !hasQuestionAudioExplanation(
            explanation,
        )
    ) {
        return null;
    }

    async function togglePlayback() {
        const element =
            audioRef.current;

        if (
            !element ||
            hasError
        ) {
            return;
        }

        if (
            !element.paused
        ) {
            element.pause();
            return;
        }

        pauseOtherExplanationAudios(
            element,
        );

        try {
            if (
                hasEnded ||
                (
                    Number.isFinite(
                        element.duration,
                    ) &&
                    element.currentTime >=
                    element.duration
                )
            ) {
                element.currentTime =
                    0;

                setCurrentTime(
                    0,
                );
            }

            setHasEnded(
                false,
            );

            await element.play();
        } catch {
            setHasError(
                true,
            );
            setIsPlaying(
                false,
            );
        }
    }

    function handleSeek(
        value: number,
    ) {
        const element =
            audioRef.current;

        if (
            !element ||
            !Number.isFinite(
                element.duration,
            )
        ) {
            return;
        }

        const safeValue =
            Math.min(
                Math.max(
                    value,
                    0,
                ),
                element.duration,
            );

        element.currentTime =
            safeValue;

        setCurrentTime(
            safeValue,
        );

        setHasEnded(
            false,
        );
    }

    return (
        <section
            className={
                styles.card
            }
            aria-label={
                title
            }
        >
            <audio
                ref={
                    audioRef
                }
                src={
                    explanation
                        .audio
                        .src
                }
                preload="metadata"
                data-question-explanation-audio="true"
                onLoadedMetadata={(
                    event,
                ) => {
                    const nextDuration =
                        event
                            .currentTarget
                            .duration;

                    setDuration(
                        Number.isFinite(
                            nextDuration,
                        )
                            ? nextDuration
                            : 0,
                    );
                }}
                onDurationChange={(
                    event,
                ) => {
                    const nextDuration =
                        event
                            .currentTarget
                            .duration;

                    if (
                        Number.isFinite(
                            nextDuration,
                        )
                    ) {
                        setDuration(
                            nextDuration,
                        );
                    }
                }}
                onTimeUpdate={(
                    event,
                ) => {
                    setCurrentTime(
                        event
                            .currentTarget
                            .currentTime,
                    );
                }}
                onPlay={() => {
                    setIsPlaying(
                        true,
                    );

                    setHasEnded(
                        false,
                    );
                }}
                onPause={() => {
                    setIsPlaying(
                        false,
                    );
                }}
                onEnded={(
                    event,
                ) => {
                    setIsPlaying(
                        false,
                    );

                    setHasEnded(
                        true,
                    );

                    const element =
                        event.currentTarget;

                    if (
                        Number.isFinite(
                            element.duration,
                        )
                    ) {
                        setCurrentTime(
                            element.duration,
                        );
                    }
                }}
                onError={() => {
                    setHasError(
                        true,
                    );

                    setIsPlaying(
                        false,
                    );
                }}
            />

            <header
                className={
                    styles.header
                }
            >
                <span
                    className={
                        styles.icon
                    }
                    aria-hidden="true"
                >
                    <HeadphonesIcon />
                </span>

                <div>
                    <strong>
                        {title}
                    </strong>

                    <small>
                        {hasError
                            ? "Audio fayl topilmadi"
                            : hasEnded
                                ? "Izoh tinglandi"
                                : isPlaying
                                    ? "Ustozning izohi tinglanmoqda"
                                    : "Savol yechimini ustoz izohlaydi"}
                    </small>
                </div>
            </header>

            <div
                className={
                    styles.player
                }
            >
                <button
                    type="button"
                    className={
                        styles.playButton
                    }
                    disabled={
                        hasError
                    }
                    aria-label={
                        isPlaying
                            ? "Ovozli izohni pauza qilish"
                            : hasEnded
                                ? "Ovozli izohni qayta tinglash"
                                : "Ovozli izohni tinglash"
                    }
                    onClick={
                        togglePlayback
                    }
                >
                    {isPlaying ? (
                        <PauseIcon />
                    ) : (
                        <PlayIcon />
                    )}
                </button>

                <div
                    className={
                        styles.timeline
                    }
                >
                    <input
                        type="range"
                        min={
                            0
                        }
                        max={
                            duration >
                            0
                                ? duration
                                : 0
                        }
                        step={
                            0.1
                        }
                        value={
                            Math.min(
                                currentTime,
                                duration >
                                0
                                    ? duration
                                    : 0,
                            )
                        }
                        disabled={
                            hasError ||
                            duration <=
                            0
                        }
                        aria-label="Audio davomiyligi"
                        onChange={(
                            event,
                        ) => {
                            handleSeek(
                                Number(
                                    event
                                        .target
                                        .value,
                                ),
                            );
                        }}
                    />

                    <div
                        className={
                            styles.timeRow
                        }
                    >
                        <span>
                            {formatAudioTime(
                                currentTime,
                            )}
                        </span>

                        <span>
                            {durationText}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}