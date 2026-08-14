"use client";

import type {
    AdminDraftEssayQuestion,
} from "../model/admin-question-types";

import styles from "./admin-diagnostic-essay-editor.module.css";

interface AdminDiagnosticEssayEditorProps {
    readonly question:
        AdminDraftEssayQuestion;
    readonly onChange:
        (
            question:
                AdminDraftEssayQuestion,
        ) => void;
}

function joinLines(
    values:
        readonly string[],
): string {
    return values.join(
        "\n",
    );
}

function splitLines(
    value:
        string,
): readonly string[] {
    return value
        .split(
            "\n",
        )
        .map(
            (item) =>
                item
                    .replace(
                        /^[-•]\s*/u,
                        "",
                    )
                    .trim(),
        )
        .filter(
            Boolean,
        );
}

function numberOrNull(
    value:
        string,
): number | null {
    if (
        value.trim() ===
        ""
    ) {
        return null;
    }

    const parsed =
        Number(
            value,
        );

    return Number.isFinite(
        parsed,
    )
        ? parsed
        : null;
}

export function AdminDiagnosticEssayEditor({
    question,
    onChange,
}: AdminDiagnosticEssayEditorProps) {
    function update(
        patch:
            Partial<
                AdminDraftEssayQuestion
            >,
    ) {
        onChange({
            ...question,
            ...patch,
        });
    }

    function updateRequirements(
        patch:
            Partial<
                AdminDraftEssayQuestion["requirements"]
            >,
    ) {
        update({
            requirements: {
                ...question.requirements,
                ...patch,
            },
        });
    }

    return (
        <section
            className={
                styles.section
            }
            id="admin-diagnostic-essay-editor"
        >
            <div
                className={
                    styles.heading
                }
            >
                <div>
                    <span>
                        45-SAVOL · ESSE
                    </span>
                    <h2>
                        Diagnostika esse muharriri
                    </h2>
                    <p>
                        Vaziyat, yozish talablari va 24 ballik
                        topshiriqni tekshiring.
                    </p>
                </div>

                <strong>
                    {question.maximumScore} ball
                </strong>
            </div>

            <div
                className={
                    styles.grid
                }
            >
                <label>
                    <span>
                        Sarlavha
                    </span>
                    <input
                        value={
                            question.topic
                        }
                        onChange={(event) =>
                            update({
                                topic:
                                    event.target.value,
                            })
                        }
                    />
                </label>

                <label>
                    <span>
                        Ball
                    </span>
                    <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={
                            question.maximumScore
                        }
                        onChange={(event) =>
                            update({
                                maximumScore:
                                    Number(
                                        event.target.value,
                                    ),
                            })
                        }
                    />
                </label>

                <label
                    className={
                        styles.full
                    }
                >
                    <span>
                        Topshiriq matni
                    </span>
                    <textarea
                        rows={3}
                        value={
                            question.question
                        }
                        onChange={(event) =>
                            update({
                                question:
                                    event.target.value,
                            })
                        }
                    />
                </label>

                <label
                    className={
                        styles.full
                    }
                >
                    <span>
                        Vaziyat
                    </span>
                    <textarea
                        rows={5}
                        value={
                            question.context ??
                            ""
                        }
                        onChange={(event) =>
                            update({
                                context:
                                    event.target.value ||
                                    null,
                            })
                        }
                    />
                </label>

                <label>
                    <span>
                        Minimal so‘z
                    </span>
                    <input
                        type="number"
                        min={0}
                        value={
                            question.requirements.minimumWords ??
                            ""
                        }
                        onChange={(event) =>
                            updateRequirements({
                                minimumWords:
                                    numberOrNull(
                                        event.target.value,
                                    ),
                            })
                        }
                    />
                </label>

                <label>
                    <span>
                        Tavsiya etilgan so‘z
                    </span>
                    <input
                        type="number"
                        min={0}
                        value={
                            question.requirements.recommendedWords ??
                            ""
                        }
                        onChange={(event) =>
                            updateRequirements({
                                recommendedWords:
                                    numberOrNull(
                                        event.target.value,
                                    ),
                            })
                        }
                    />
                </label>

                <label>
                    <span>
                        Maksimal so‘z
                    </span>
                    <input
                        type="number"
                        min={0}
                        value={
                            question.requirements.maximumWords ??
                            ""
                        }
                        onChange={(event) =>
                            updateRequirements({
                                maximumWords:
                                    numberOrNull(
                                        event.target.value,
                                    ),
                            })
                        }
                    />
                </label>

                <label>
                    <span>
                        Tavsiya etilgan xatboshi
                    </span>
                    <input
                        type="number"
                        min={0}
                        value={
                            question.requirements.recommendedParagraphs ??
                            ""
                        }
                        onChange={(event) =>
                            updateRequirements({
                                recommendedParagraphs:
                                    numberOrNull(
                                        event.target.value,
                                    ),
                            })
                        }
                    />
                </label>

                <label
                    className={
                        styles.full
                    }
                >
                    <span>
                        Kirish talablari — har bir talab yangi qatorda
                    </span>
                    <textarea
                        rows={4}
                        value={
                            joinLines(
                                question.requirements.introduction ??
                                [],
                            )
                        }
                        onChange={(event) =>
                            updateRequirements({
                                introduction:
                                    splitLines(
                                        event.target.value,
                                    ),
                            })
                        }
                    />
                </label>

                <label
                    className={
                        styles.full
                    }
                >
                    <span>
                        Asosiy qism talablari — har bir talab yangi qatorda
                    </span>
                    <textarea
                        rows={6}
                        value={
                            joinLines(
                                question.requirements.body ??
                                [],
                            )
                        }
                        onChange={(event) =>
                            updateRequirements({
                                body:
                                    splitLines(
                                        event.target.value,
                                    ),
                            })
                        }
                    />
                </label>

                <label
                    className={
                        styles.full
                    }
                >
                    <span>
                        Xulosa talablari — har bir talab yangi qatorda
                    </span>
                    <textarea
                        rows={4}
                        value={
                            joinLines(
                                question.requirements.conclusion ??
                                [],
                            )
                        }
                        onChange={(event) =>
                            updateRequirements({
                                conclusion:
                                    splitLines(
                                        event.target.value,
                                    ),
                            })
                        }
                    />
                </label>

                <label
                    className={
                        styles.full
                    }
                >
                    <span>
                        Ogohlantirishlar — har biri yangi qatorda
                    </span>
                    <textarea
                        rows={4}
                        value={
                            joinLines(
                                question.requirements.warnings ??
                                [],
                            )
                        }
                        onChange={(event) =>
                            updateRequirements({
                                warnings:
                                    splitLines(
                                        event.target.value,
                                    ),
                            })
                        }
                    />
                </label>

                <label
                    className={
                        styles.full
                    }
                >
                    <span>
                        Qo‘shimcha rubrika — har biri yangi qatorda
                    </span>
                    <textarea
                        rows={3}
                        value={
                            joinLines(
                                question.requirements.rubric,
                            )
                        }
                        onChange={(event) =>
                            updateRequirements({
                                rubric:
                                    splitLines(
                                        event.target.value,
                                    ),
                            })
                        }
                    />
                </label>
            </div>
        </section>
    );
}
