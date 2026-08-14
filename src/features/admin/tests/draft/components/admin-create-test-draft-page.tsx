"use client";

import Link from "next/link";
import {
    useActionState,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    createAdminTestDraftAction,
} from "../actions/create-admin-test-draft-action";
import {
    initialCreateAdminTestDraftActionState,
} from "../model/create-admin-test-draft-action-state";

import styles from "./admin-create-test-draft-page.module.css";

type AdminCreateGroup =
    | "grammar"
    | "national-certificate";

type CategoryRecommendation = {
    readonly value: string;
    readonly label: string;
    readonly topicSlug: string;
    readonly format:
        | "standard"
        | "passage-five"
        | "standard-five"
        | "mixed"
        | "diagnostic"
        | "morphology-standard";
    readonly morphologySubtopicRequired?: boolean;
};

const categoryRecommendations:
    Readonly<
        Record<
            AdminCreateGroup,
            readonly CategoryRecommendation[]
        >
    > = {
        grammar: [
            {
                value: "Imlo",
                label: "Imlo",
                topicSlug: "imlo",
                format: "standard",
            },
            {
                value: "Leksikologiya",
                label: "Leksikologiya",
                topicSlug: "leksikologiya",
                format: "standard",
            },
            {
                value: "Morfemika",
                label: "Morfemika",
                topicSlug: "morfemika",
                format: "standard",
            },
            {
                value: "Morfologiya",
                label: "Morfologiya",
                topicSlug: "",
                format: "morphology-standard",
                morphologySubtopicRequired: true,
            },
            {
                value: "Sintaksis",
                label: "Sintaksis",
                topicSlug: "sintaksis",
                format: "standard",
            },
            {
                value: "Punktuatsiya",
                label: "Punktuatsiya",
                topicSlug: "punktuatsiya",
                format: "standard",
            },
            {
                value: "Uslubiyat",
                label: "Uslubiyat",
                topicSlug: "uslubiyat",
                format: "standard",
            },
        ],
        "national-certificate": [
            {
                value: "Badiiy asarlar",
                label: "Badiiy asarlar",
                topicSlug: "badiiy-asarlar",
                format: "standard-five",
            },
            {
                value: "Ilmiy matn",
                label: "Ilmiy matn",
                topicSlug: "ilmiy-matn",
                format: "passage-five",
            },
            {
                value: "Badiiy matn",
                label: "Badiiy matn",
                topicSlug: "badiiy-matn",
                format: "passage-five",
            },
            {
                value: "G‘azal",
                label: "G‘azal",
                topicSlug: "gazal",
                format: "passage-five",
            },
            {
                value: "Aralash",
                label: "Aralash",
                topicSlug: "aralash",
                format: "mixed",
            },
            {
                value: "Diagnostika",
                label: "Diagnostika",
                topicSlug: "diagnostika",
                format: "diagnostic",
            },
        ],
    };

const morphologySubtopics = [
    {
        value: "ot",
        label: "Ot",
    },
    {
        value: "sifat",
        label: "Sifat",
    },
    {
        value: "olmosh",
        label: "Olmosh",
    },
    {
        value: "ravish",
        label: "Ravish",
    },
    {
        value: "fel",
        label: "Fe’l",
    },
    {
        value: "komakchi",
        label: "Ko‘makchi",
    },
    {
        value: "boglovchi",
        label: "Bog‘lovchi",
    },
] as const;

const morphologySubtopicSlugs =
    new Set<string>(
        morphologySubtopics.map(
            (item) =>
                item.value,
        ),
    );


function FieldError({
    message,
}: {
    readonly message:
        string | undefined;
}) {
    if (!message) {
        return null;
    }

    return (
        <small
            className={
                styles.fieldError
            }
        >
            {message}
        </small>
    );
}

export function AdminCreateTestDraftPage() {
    const [
        state,
        formAction,
        pending,
    ] = useActionState(
        createAdminTestDraftAction,
        initialCreateAdminTestDraftActionState,
    );

    const [group, setGroup] =
        useState<AdminCreateGroup>(
            state.values.group ===
                "national-certificate"
                ? "national-certificate"
                : "grammar",
        );
    const [category, setCategory] =
        useState(
            state.values.category,
        );
    const [topicSlug, setTopicSlug] =
        useState(
            state.values.topicSlug,
        );
    const [slug, setSlug] =
        useState(
            state.values.slug,
        );
    const [format, setFormat] =
        useState(
            state.values.format,
        );
    const [difficulty, setDifficulty] =
        useState(
            state.values.difficulty,
        );
    const [estimatedMinutes, setEstimatedMinutes] =
        useState(
            state.values.estimatedMinutes,
        );

    const availableCategories =
        useMemo(
            () =>
                categoryRecommendations[
                    group
                ],
            [group],
        );

    const isMorphology =
        group ===
            "grammar" &&
        category ===
            "Morfologiya";

    const isDiagnostic =
        format ===
        "diagnostic";

    const submittedGroup =
        isMorphology
            ? "morphology"
            : group;

    const routePreview =
        group ===
        "national-certificate"
            ? `/tests/milliy-sertifikat/${topicSlug || "{topic}"}/${slug || "{test-slug}"}`
            : isMorphology
              ? `/tests/grammatika/morfologiya/${topicSlug || "{bo‘lim}"}/${slug || "{test-slug}"}`
              : `/tests/grammatika/${topicSlug || "{topic}"}/${slug || "{test-slug}"}`;

    useEffect(
        () => {
            const restoredVisibleGroup:
                AdminCreateGroup =
                state.values.group ===
                    "national-certificate"
                    ? "national-certificate"
                    : "grammar";

            const matchingCategory =
                categoryRecommendations[
                    restoredVisibleGroup
                ].find(
                    (item) =>
                        item.value ===
                        state.values.category,
                );

            if (
                state.status !==
                "error"
            ) {
                return;
            }

            const nextGroup =
                restoredVisibleGroup;

            setGroup(
                nextGroup,
            );
            setCategory(
                state.values.category,
            );
            setTopicSlug(
                state.values.category ===
                    "Morfologiya" &&
                morphologySubtopicSlugs.has(
                    state.values.topicSlug,
                )
                    ? state.values.topicSlug
                    : matchingCategory?.topicSlug ??
                        state.values.topicSlug,
            );
            setSlug(
                state.values.slug,
            );
            setFormat(
                state.values.format,
            );
            setDifficulty(
                state.values.difficulty,
            );
            setEstimatedMinutes(
                state.values.estimatedMinutes,
            );
        },
        [state],
    );

    function applyCategory(
        nextCategory:
            string,
        nextGroup =
            group,
    ) {
        setCategory(
            nextCategory,
        );

        const recommendation =
            categoryRecommendations[
                nextGroup
            ].find(
                (item) =>
                    item.value ===
                    nextCategory,
            );

        if (!recommendation) {
            setTopicSlug(
                "",
            );
            return;
        }

        setTopicSlug(
            recommendation.morphologySubtopicRequired
                ? ""
                : recommendation.topicSlug,
        );
        setFormat(
            recommendation.format,
        );

        if (
            recommendation.format ===
            "diagnostic"
        ) {
            setDifficulty(
                "hard",
            );
            setEstimatedMinutes(
                "180",
            );
        }
    }

    function handleGroupChange(
        nextGroup:
            AdminCreateGroup,
    ) {
        setGroup(
            nextGroup,
        );

        const firstCategory =
            categoryRecommendations[
                nextGroup
            ][0];

        if (firstCategory) {
            applyCategory(
                firstCategory.value,
                nextGroup,
            );
        } else {
            setCategory(
                "",
            );
            setTopicSlug(
                "",
            );
        }
    }

    return (
        <>
            <header className={styles.header}>
                <div>
                    <Link
                        href="/admin/tests"
                        className={
                            styles.backLink
                        }
                    >
                        ← Testlar katalogiga qaytish
                    </Link>

                    <span
                        className={
                            styles.eyebrow
                        }
                    >
                        YANGI TEST DRAFTI
                    </span>

                    <h1>
                        Yangi test yaratish
                    </h1>

                    <p>
                        Avval testning asosiy
                        ma’lumotlarini kiriting.
                        Savollar keyingi bosqichda
                        qo‘shiladi.
                    </p>
                </div>
            </header>

            <form
                action={formAction}
                className={styles.form}
            >
                {state.message && (
                    <div
                        className={
                            styles.errorBanner
                        }
                        role="alert"
                    >
                        {state.message}
                    </div>
                )}

                <section
                    className={
                        styles.section
                    }
                >
                    <div
                        className={
                            styles.sectionHeading
                        }
                    >
                        <span>
                            01
                        </span>

                        <div>
                            <h2>
                                Asosiy ma’lumotlar
                            </h2>
                            <p>
                                Admin katalogida
                                ko‘rinadigan nom va
                                tavsif.
                            </p>
                        </div>
                    </div>

                    <div
                        className={
                            styles.grid
                        }
                    >
                        <label
                            className={
                                styles.fullWidth
                            }
                        >
                            <span>
                                Test nomi *
                            </span>
                            <input
                                name="title"
                                defaultValue={
                                    state.values.title
                                }
                                placeholder="Masalan: Imlo — 2-tip test"
                                required
                            />
                            <FieldError
                                message={
                                    state.fieldErrors
                                        .title
                                }
                            />
                        </label>

                        <label
                            className={
                                styles.fullWidth
                            }
                        >
                            <span>
                                Tavsif
                            </span>
                            <textarea
                                name="description"
                                defaultValue={
                                    state.values
                                        .description
                                }
                                placeholder="Test nimani tekshirishi haqida qisqa izoh..."
                                rows={4}
                            />
                            <FieldError
                                message={
                                    state.fieldErrors
                                        .description
                                }
                            />
                        </label>

                        <label>
                            <span>
                                Guruh *
                            </span>
                            <select
                                value={group}
                                onChange={(event) =>
                                    handleGroupChange(
                                        event.target.value as
                                            AdminCreateGroup,
                                    )
                                }
                            >
                                <option value="grammar">
                                    Grammatika
                                </option>
                                <option value="national-certificate">
                                    Milliy sertifikat
                                </option>
                            </select>
                            <input
                                type="hidden"
                                name="group"
                                value={submittedGroup}
                            />
                            <FieldError
                                message={
                                    state.fieldErrors
                                        .group
                                }
                            />
                        </label>

                        <label>
                            <span>
                                Kategoriya *
                            </span>
                            <select
                                name="category"
                                value={category}
                                onChange={(event) =>
                                    applyCategory(
                                        event.target.value,
                                    )
                                }
                                required
                            >
                                <option value="">
                                    Kategoriyani tanlang
                                </option>
                                {availableCategories.map(
                                    (item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    ),
                                )}
                            </select>
                            <FieldError
                                message={
                                    state.fieldErrors
                                        .category
                                }
                            />
                        </label>

                        {isMorphology && (
                            <label
                                className={
                                    styles.fullWidth
                                }
                            >
                                <span>
                                    Morfologiya bo‘limi *
                                </span>
                                <select
                                    value={topicSlug}
                                    onChange={(event) =>
                                        setTopicSlug(
                                            event.target.value,
                                        )
                                    }
                                    required
                                >
                                    <option value="">
                                        Bo‘limni tanlang
                                    </option>
                                    {morphologySubtopics.map(
                                        (item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        ),
                                    )}
                                </select>
                                <small
                                    className={
                                        styles.fieldHint
                                    }
                                >
                                    Masalan: Ot → /morfologiya/ot/
                                </small>
                            </label>
                        )}
                    </div>
                </section>

                <section
                    className={
                        styles.section
                    }
                >
                    <div
                        className={
                            styles.sectionHeading
                        }
                    >
                        <span>
                            02
                        </span>

                        <div>
                            <h2>
                                Route va format
                            </h2>
                            <p>
                                Testning ichki
                                manzili va ishlash
                                formati.
                            </p>
                        </div>
                    </div>

                    <div
                        className={
                            styles.grid
                        }
                    >
                        <label>
                            <span>
                                Topic slug *
                            </span>
                            <input
                                name="topicSlug"
                                value={topicSlug}
                                readOnly
                                placeholder="Kategoriya tanlang"
                                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                                required
                            />
                            <small
                                className={
                                    styles.fieldHint
                                }
                            >
                                {isMorphology
                                    ? "Morfologiya bo‘limidan avtomatik olinadi."
                                    : "Kategoriya tanlanganda avtomatik belgilanadi."}
                            </small>
                            <FieldError
                                message={
                                    state.fieldErrors
                                        .topicSlug
                                }
                            />
                        </label>

                        <label>
                            <span>
                                Test slug *
                            </span>
                            <input
                                name="slug"
                                value={slug}
                                onChange={(event) =>
                                    setSlug(
                                        event.target.value,
                                    )
                                }
                                placeholder={
                                    isMorphology
                                        ? "1"
                                        : "2-tip"
                                }
                                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                                required
                            />
                            <FieldError
                                message={
                                    state.fieldErrors
                                        .slug
                                }
                            />
                        </label>

                        <label>
                            <span>
                                Format *
                            </span>
                            <select
                                name="format"
                                value={format}
                                disabled={
                                    isDiagnostic ||
                                    isMorphology
                                }
                                onChange={(event) => {
                                    const nextFormat =
                                        event.target.value;

                                    setFormat(
                                        nextFormat,
                                    );

                                    if (
                                        nextFormat ===
                                        "diagnostic"
                                    ) {
                                        setGroup(
                                            "national-certificate",
                                        );
                                        applyCategory(
                                            "Diagnostika",
                                            "national-certificate",
                                        );
                                    }
                                }}
                            >
                                <option value="standard">
                                    Standart
                                </option>
                                <option value="passage-five">
                                    Matn + 5 savol
                                </option>
                                <option value="standard-five">
                                    5 ta savol
                                </option>
                                <option value="mixed">
                                    Aralash
                                </option>
                                <option value="diagnostic">
                                    To‘liq diagnostika
                                </option>
                                <option value="morphology-standard">
                                    Morfologiya ichki testi
                                </option>
                            </select>
                            {(isDiagnostic ||
                                isMorphology) && (
                                <input
                                    type="hidden"
                                    name="format"
                                    value={
                                        isDiagnostic
                                            ? "diagnostic"
                                            : "morphology-standard"
                                    }
                                />
                            )}
                            <FieldError
                                message={
                                    state.fieldErrors
                                        .format
                                }
                            />
                        </label>

                        <label>
                            <span>
                                Qiyinlik *
                            </span>
                            <select
                                name="difficulty"
                                value={difficulty}
                                onChange={(event) =>
                                    setDifficulty(
                                        event.target.value,
                                    )
                                }
                                disabled={
                                    isDiagnostic
                                }
                            >
                                <option value="easy">
                                    Oson
                                </option>
                                <option value="medium">
                                    O‘rta
                                </option>
                                <option value="hard">
                                    Qiyin
                                </option>
                            </select>
                            {isDiagnostic && (
                                <input
                                    type="hidden"
                                    name="difficulty"
                                    value="hard"
                                />
                            )}
                            <FieldError
                                message={
                                    state.fieldErrors
                                        .difficulty
                                }
                            />
                        </label>
                    </div>

                    <div
                        className={
                            styles.routePreview
                        }
                    >
                        <span>
                            Yakuniy route
                        </span>
                        <code>
                            {routePreview}
                        </code>
                    </div>
                </section>

                <section
                    className={
                        styles.section
                    }
                >
                    <div
                        className={
                            styles.sectionHeading
                        }
                    >
                        <span>
                            03
                        </span>

                        <div>
                            <h2>
                                Kirish va vaqt
                            </h2>
                            <p>
                                Foydalanuvchi access’i
                                va test davomiyligi.
                            </p>
                        </div>
                    </div>

                    <div
                        className={
                            styles.grid
                        }
                    >
                        <label>
                            <span>
                                Access *
                            </span>
                            <select
                                name="access"
                                defaultValue={
                                    state.values
                                        .access
                                }
                            >
                                <option value="free">
                                    Bepul
                                </option>
                                <option value="premium">
                                    Premium
                                </option>
                            </select>
                            <FieldError
                                message={
                                    state.fieldErrors
                                        .access
                                }
                            />
                        </label>

                        <label>
                            <span>
                                Vaqt, daqiqa *
                            </span>
                            <input
                                name="estimatedMinutes"
                                type="number"
                                min={1}
                                max={600}
                                step={1}
                                value={estimatedMinutes}
                                onChange={(event) =>
                                    setEstimatedMinutes(
                                        event.target.value,
                                    )
                                }
                                readOnly={
                                    isDiagnostic
                                }
                                required
                            />
                            <FieldError
                                message={
                                    state.fieldErrors
                                        .estimatedMinutes
                                }
                            />
                        </label>
                    </div>
                </section>

                <div
                    className={
                        styles.actions
                    }
                >
                    <Link
                        href="/admin/tests"
                        className={
                            styles.cancelButton
                        }
                    >
                        Bekor qilish
                    </Link>

                    <button
                        type="submit"
                        disabled={pending}
                        className={
                            styles.submitButton
                        }
                    >
                        {pending
                            ? "Saqlanmoqda..."
                            : "Draft yaratish"}
                    </button>
                </div>
            </form>
        </>
    );
}
