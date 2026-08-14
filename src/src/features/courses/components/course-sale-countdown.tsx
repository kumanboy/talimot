"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import styles from "./course-sale-countdown.module.css";

type CourseSaleCountdownProps = {
    readonly endsAt: string;
};

type RemainingTime = {
    readonly days: number;
    readonly hours: number;
    readonly minutes: number;
    readonly seconds: number;
    readonly expired: boolean;
};

function calculateRemainingTime(
    endsAt: string,
): RemainingTime {
    const difference =
        new Date(endsAt).getTime() - Date.now();

    if (difference <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            expired: true,
        };
    }

    const totalSeconds = Math.floor(difference / 1000);

    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        expired: false,
    };
}

function formatValue(value: number): string {
    return String(value).padStart(2, "0");
}

export function CourseSaleCountdown({
    endsAt,
}: CourseSaleCountdownProps) {
    const initialValue = useMemo(
        () => calculateRemainingTime(endsAt),
        [endsAt],
    );

    const [remainingTime, setRemainingTime] =
        useState<RemainingTime>(initialValue);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setRemainingTime(
                calculateRemainingTime(endsAt),
            );
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [endsAt]);

    if (remainingTime.expired) {
        return (
            <div
                className={styles.expired}
                role="status"
            >
                Aksiya yakunlandi
            </div>
        );
    }

    const units = [
        [remainingTime.days, "KUN"],
        [remainingTime.hours, "SOAT"],
        [remainingTime.minutes, "DAQIQA"],
        [remainingTime.seconds, "SONIYA"],
    ] as const;

    return (
        <section
            className={styles.countdown}
            aria-label="Aksiya tugashiga qolgan vaqt"
        >
            <span className={styles.label}>
                Aksiya tugashiga
            </span>

            <div className={styles.units}>
                {units.map(([value, label]) => (
                    <div key={label}>
                        <strong>{formatValue(value)}</strong>
                        <span>{label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
