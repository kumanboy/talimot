"use client";

import { useEffect, useState } from "react";

import { ButtonLoader } from "@/components/ui/button-loader";

import styles from "./test-exit-dialog.module.css";

type TestExitDialogProps = {
    readonly open: boolean;
    readonly onContinue: () => void;
    readonly onSaveAndExit: () => void;
};

function CloseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="m7 7 10 10M17 7 7 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function TestExitDialog({
    open,
    onContinue,
    onSaveAndExit,
}: TestExitDialogProps) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (!open) setIsExiting(false);
    }, [open]);

    if (!open) {
        return null;
    }

    return (
        <div
            className={styles.backdrop}
            role="presentation"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onContinue();
                }
            }}
        >
            <section
                className={styles.dialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="test-exit-title"
            >
                <span
                    className={styles.icon}
                    aria-hidden="true"
                >
                    <CloseIcon />
                </span>

                <h2 id="test-exit-title">
                    Testdan chiqasizmi?
                </h2>

                <p>
                    Javoblaringiz va qolgan
                    vaqtingiz saqlanadi.
                    Testni keyin davom
                    ettirishingiz mumkin.
                </p>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.saveButton}
                        disabled={isExiting}
                        aria-busy={isExiting || undefined}
                        onClick={() => {
                            if (isExiting) return;
                            setIsExiting(true);
                            onSaveAndExit();
                        }}
                    >
                        {isExiting ? (
                            <><ButtonLoader /> Chiqilmoqda...</>
                        ) : "Saqlash va chiqish"}
                    </button>

                    <button
                        type="button"
                        className={styles.continueButton}
                        disabled={isExiting}
                        onClick={onContinue}
                    >
                        Testni davom ettirish
                    </button>
                </div>
            </section>
        </div>
    );
}
