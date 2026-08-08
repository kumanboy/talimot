"use client";

import {
    useActionState,
} from "react";

import {
    previewAdminDocxImportAction,
} from "../actions/preview-admin-docx-import-action";
import {
    initialAdminDocxImportPreviewActionState,
} from "../model/admin-docx-import-preview-action-state";
import type {
    AdminDiagnosticDocxParseResult,
} from "../model/admin-diagnostic-docx-parser-types";
import type {
    AdminPassageDocxParseResult,
} from "../model/admin-passage-docx-parser-types";
import type {
    AdminGhazalDocxParseResult,
} from "../model/admin-ghazal-docx-parser-types";
import type {
    AdminMixedDocxParseResult,
} from "../model/admin-mixed-docx-parser-types";

import styles from "./admin-diagnostic-section-docx-importer.module.css";

export type AdminDiagnosticSectionDocxTarget =
    | "multiple-choice"
    | "scientific-text"
    | "literary-text"
    | "ghazal"
    | "structured"
    | "essay";

interface AdminDiagnosticSectionDocxImporterProps {
    readonly target:
        AdminDiagnosticSectionDocxTarget;
    readonly title: string;
    readonly rangeLabel: string;
    readonly onImportDiagnostic?: (
        diagnostic:
            AdminDiagnosticDocxParseResult,
    ) => void;
    readonly onImportPassage?: (
        passage:
            AdminPassageDocxParseResult,
    ) => void;
    readonly onImportGhazal?: (
        ghazal:
            AdminGhazalDocxParseResult,
    ) => void;
    readonly onImportMixed?: (
        mixed:
            AdminMixedDocxParseResult,
    ) => void;
}

function targetDescription(
    target:
        AdminDiagnosticSectionDocxTarget,
): string {
    if (
        target ===
        "multiple-choice"
    ) {
        return "1–17-savollar: A–D variantli testlar. 4, 8 va 12-savol rasmlari importdan keyin alohida yuklanadi.";
    }

    if (
        target ===
        "scientific-text"
    ) {
        return "Ilmiy matn, matn bloklari va 5 ta savol";
    }

    if (
        target ===
        "literary-text"
    ) {
        return "Badiiy matn, matn bloklari va 5 ta savol";
    }

    if (target === "ghazal") {
        return "G‘azal, baytlar, lug‘at va 5 ta savol";
    }

    if (
        target ===
        "essay"
    ) {
        return "45-savol: esse vaziyati, yozish talablari va 24 ballik topshiriq";
    }

    return "33–44-savollar: matching, qisqa javob va multipart. 36-savol rasmi importdan keyin alohida yuklanadi.";
}

function exactOrders(
    values:
        readonly number[],
    start:
        number,
    end:
        number,
): boolean {
    const expected =
        Array.from(
            {
                length:
                    end -
                    start +
                    1,
            },
            (
                _value,
                index,
            ) =>
                start +
                index,
        );

    if (
        values.length !==
        expected.length
    ) {
        return false;
    }

    const actual = [
        ...values,
    ].sort(
        (
            left,
            right,
        ) =>
            left - right,
    );

    return expected.every(
        (
            value,
            index,
        ) =>
            actual[index] ===
            value,
    );
}

function diagnosticShapeIssue(
    target:
        AdminDiagnosticSectionDocxTarget,
    parsedDiagnostic:
        AdminDiagnosticDocxParseResult | null,
): string | null {
    if (!parsedDiagnostic) {
        return null;
    }

    if (
        target ===
        "multiple-choice"
    ) {
        const questions =
            parsedDiagnostic.questions;

        const sourceOrders =
            questions.flatMap(
                (question) =>
                    question.type ===
                    "multiple-choice"
                        ? [
                            question.sourceOrder,
                        ]
                        : [],
            );

        if (
            questions.some(
                (question) =>
                    question.type !==
                    "multiple-choice",
            )
        ) {
            return "1–17 DOCX faylida faqat multiple-choice savollar bo‘lishi kerak.";
        }

        if (
            !exactOrders(
                sourceOrders,
                1,
                17,
            )
        ) {
            return "1–17 DOCX faylida savol raqamlari aynan 1 dan 17 gacha to‘liq bo‘lishi kerak.";
        }

        return null;
    }

    if (target === "essay") {
        if (
            parsedDiagnostic.questions.length !==
            1
        ) {
            return "45-savol DOCX faylida faqat bitta esse topshirig‘i bo‘lishi kerak.";
        }

        const question =
            parsedDiagnostic.questions[0];

        if (
            !question ||
            question.type !==
                "essay" ||
            question.sourceOrder !==
                45
        ) {
            return "Esse DOCX faylida SAVOL 45 va TUR: ESSAY bo‘lishi kerak.";
        }
    }

    return null;
}

export function AdminDiagnosticSectionDocxImporter({
    target,
    title,
    rangeLabel,
    onImportDiagnostic,
    onImportPassage,
    onImportGhazal,
    onImportMixed,
}: AdminDiagnosticSectionDocxImporterProps) {
    const [
        state,
        formAction,
        pending,
    ] = useActionState(
        previewAdminDocxImportAction,
        initialAdminDocxImportPreviewActionState,
    );

    const parsedDiagnostic =
        target ===
            "multiple-choice" ||
        target === "essay"
            ? state.parsedDiagnostic
            : null;

    const parsedPassage =
        target ===
            "scientific-text" ||
        target ===
            "literary-text"
            ? state.parsedPassage
            : null;

    const parsedGhazal =
        target === "ghazal"
            ? state.parsedGhazal
            : null;

    const parsedMixed =
        target === "structured"
            ? state.parsedMixed
            : null;

    const parsedResult =
        parsedDiagnostic ??
        parsedPassage ??
        parsedGhazal ??
        parsedMixed;

    const wrongPassageTopic =
        parsedPassage !== null &&
        parsedPassage.metadata.topic !==
            target;

    const shapeIssue =
        diagnosticShapeIssue(
            target,
            parsedDiagnostic,
        );

    const canImport =
        parsedResult !== null &&
        parsedResult.confidence !==
            "invalid" &&
        !wrongPassageTopic &&
        shapeIssue === null;

    function handleImport() {
        if (!canImport) {
            return;
        }

        if (
            parsedDiagnostic &&
            onImportDiagnostic
        ) {
            onImportDiagnostic(
                parsedDiagnostic,
            );
            return;
        }

        if (
            parsedPassage &&
            onImportPassage
        ) {
            onImportPassage(
                parsedPassage,
            );
            return;
        }

        if (
            parsedGhazal &&
            onImportGhazal
        ) {
            onImportGhazal(
                parsedGhazal,
            );
            return;
        }

        if (
            parsedMixed &&
            onImportMixed
        ) {
            onImportMixed(
                parsedMixed,
            );
        }
    }

    const issues =
        parsedDiagnostic?.issues ??
        parsedPassage?.issues ??
        parsedGhazal?.issues ??
        parsedMixed?.issues ??
        [];

    const questionCount =
        parsedDiagnostic?.taskCount ??
        parsedPassage?.questions.length ??
        parsedGhazal?.questions.length ??
        parsedMixed?.taskCount ??
        0;

    return (
        <section
            className={
                styles.importer
            }
        >
            <div
                className={
                    styles.heading
                }
            >
                <div>
                    <span>
                        DIAGNOSTIKA DOCX · {rangeLabel}
                    </span>
                    <h3>{title}</h3>
                    <p>
                        {targetDescription(
                            target,
                        )}
                    </p>
                </div>

                <strong>
                    Faqat shu bo‘lim yangilanadi
                </strong>
            </div>

            <form
                action={formAction}
                className={
                    styles.form
                }
            >
                <input
                    type="hidden"
                    name="diagnosticSectionTarget"
                    value={target}
                />
                <label>
                    <span>
                        DOCX fayl
                    </span>
                    <input
                        type="file"
                        name="docxFile"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        required
                    />
                </label>

                <button
                    type="submit"
                    disabled={pending}
                >
                    {pending
                        ? "Tahlil qilinmoqda..."
                        : "DOCX ni tahlil qilish"}
                </button>
            </form>

            {state.status ===
                "error" && (
                <div
                    className={
                        styles.error
                    }
                    role="status"
                >
                    {state.message}
                </div>
            )}

            {state.status ===
                "success" &&
                !parsedResult && (
                <div
                    className={
                        styles.error
                    }
                    role="status"
                >
                    Bu fayl {title} uchun kutilgan DOCX strukturaga mos emas.
                </div>
            )}

            {wrongPassageTopic && (
                <div
                    className={
                        styles.error
                    }
                    role="status"
                >
                    Yuklangan passage boshqa turga tegishli. {title} uchun mos template ishlating.
                </div>
            )}

            {shapeIssue && (
                <div
                    className={
                        styles.error
                    }
                    role="status"
                >
                    {shapeIssue}
                </div>
            )}

            {parsedResult && (
                <div
                    className={
                        styles.preview
                    }
                >
                    <div
                        className={
                            styles.stats
                        }
                    >
                        <div>
                            <span>
                                Ishonchlilik
                            </span>
                            <strong>
                                {parsedResult.confidenceScore}%
                            </strong>
                        </div>
                        <div>
                            <span>
                                Topshiriqlar
                            </span>
                            <strong>
                                {questionCount}
                            </strong>
                        </div>
                        <div>
                            <span>
                                Holat
                            </span>
                            <strong>
                                {parsedResult.confidence ===
                                "high"
                                    ? "Tayyor"
                                    : parsedResult.confidence ===
                                        "review"
                                        ? "Tekshirish kerak"
                                        : "Noto‘g‘ri"}
                            </strong>
                        </div>
                    </div>

                    {issues.length >
                        0 && (
                        <ul
                            className={
                                styles.issues
                            }
                        >
                            {issues.map(
                                (issue) => (
                                    <li
                                        key={
                                            issue
                                        }
                                    >
                                        {issue}
                                    </li>
                                ),
                            )}
                        </ul>
                    )}

                    <button
                        type="button"
                        className={
                            styles.importButton
                        }
                        disabled={
                            !canImport
                        }
                        onClick={
                            handleImport
                        }
                    >
                        {rangeLabel} ga import qilish
                    </button>
                </div>
            )}
        </section>
    );
}
