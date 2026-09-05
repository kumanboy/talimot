"use client";

import {
    useEffect,
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

export function QuestionAudioExplanation({ explanation, visible = true }: QuestionAudioExplanationProps) {
    if (!visible || !hasQuestionAudioExplanation(explanation)) return null;
    // Remount when the source changes so events and pending play promises from
    // the previous recording cannot change the new player's state.
    return <AudioPlayer key={explanation.audio.src.trim()} audio={explanation.audio} />;
}

function AudioPlayer({ audio }: { audio: NonNullable<QuestionExplanation["audio"]> }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mounted = useRef(false);
    const pending = useRef(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [hasEnded, setHasEnded] = useState(false);
    const title = audio.title?.trim() || DEFAULT_AUDIO_EXPLANATION_TITLE;

    useEffect(() => {
        mounted.current = true;
        const element = audioRef.current;
        return () => {
            mounted.current = false;
            element?.pause();
        };
    }, []);

    async function togglePlayback() {
        const element = audioRef.current;
        if (!element || pending.current) return;
        if (!element.paused) {
            element.pause();
            return;
        }
        pauseOtherExplanationAudios(element);
        pending.current = true;
        setIsLoading(true);
        try {
            // A failed request can be retried without refreshing the results.
            if (error || element.error) element.load();
            setError(null);
            if (hasEnded) {
                element.currentTime = 0;
                setCurrentTime(0);
            }
            setHasEnded(false);
            await element.play();
        } catch (reason) {
            // Switching players or leaving the page may abort play normally.
            if (mounted.current && !(reason instanceof DOMException && reason.name === "AbortError")) {
                setError("Audio ijro etilmadi. Qayta urinib ko‘ring.");
            }
        } finally {
            pending.current = false;
            if (mounted.current) setIsLoading(false);
        }
    }

    function updateDuration(element: HTMLAudioElement) {
        if (Number.isFinite(element.duration)) setDuration(element.duration);
    }

    return (
        <section className={styles.card} aria-label={title}>
            <audio ref={audioRef} src={audio.src.trim()} preload="none"
                data-question-explanation-audio="true"
                onLoadedMetadata={event => updateDuration(event.currentTarget)}
                onDurationChange={event => updateDuration(event.currentTarget)}
                onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
                onPlay={event => {
                    pauseOtherExplanationAudios(event.currentTarget);
                    setIsPlaying(true);
                    setHasEnded(false);
                    setError(null);
                }}
                onPlaying={() => setIsLoading(false)}
                onWaiting={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onPause={() => { setIsPlaying(false); setIsLoading(false); }}
                onEnded={() => { setIsPlaying(false); setHasEnded(true); setIsLoading(false); }}
                onError={() => {
                    setError("Audio yuklanmadi. Qayta urinib ko‘ring.");
                    setIsPlaying(false);
                    setIsLoading(false);
                }}
            />
            <header className={styles.header}>
                <span className={styles.icon} aria-hidden="true"><HeadphonesIcon /></span>
                <div>
                    <strong>{title}</strong>
                    <small aria-live="polite">{error || (isLoading ? "Audio yuklanmoqda…" : hasEnded
                        ? "Izoh tinglandi" : isPlaying ? "Ustozning izohi tinglanmoqda"
                            : "Savol yechimini ustoz izohlaydi")}</small>
                </div>
            </header>
            <div className={styles.player}>
                <button type="button" className={styles.playButton}
                    aria-busy={isLoading || undefined}
                    aria-label={error ? "Audioni qayta yuklash" : isPlaying
                        ? "Ovozli izohni pauza qilish" : hasEnded
                            ? "Ovozli izohni qayta tinglash" : "Ovozli izohni tinglash"}
                    onClick={togglePlayback}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <div className={styles.timeline}>
                    <input type="range" min={0} max={duration} step={0.1}
                        value={Math.min(currentTime, duration)} disabled={!!error || duration <= 0}
                        aria-label="Audio davomiyligi"
                        onChange={event => {
                            const element = audioRef.current;
                            if (!element || !Number.isFinite(element.duration) || element.duration <= 0) return;
                            const value = Math.min(Math.max(Number(event.target.value), 0), element.duration);
                            element.currentTime = value;
                            setCurrentTime(value);
                            setHasEnded(false);
                        }} />
                    <div className={styles.timeRow}>
                        <span>{formatAudioTime(currentTime)}</span>
                        <span>{duration > 0 ? formatAudioTime(duration) : audio.durationLabel ?? "00:00"}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
