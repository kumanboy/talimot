"use client";

import Link from "next/link";
import {
    useActionState,
} from "react";

import {
    createAdminTestDraftAction,
} from "../actions/create-admin-test-draft-action";
import {
    initialCreateAdminTestDraftActionState,
} from "../model/create-admin-test-draft-action-state";

import styles from "./admin-create-test-draft-page.module.css";

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
                                name="group"
                                defaultValue={
                                    state.values.group
                                }
                            >
                                <option value="grammar">
                                    Grammatika
                                </option>
                                <option value="national-certificate">
                                    Milliy sertifikat
                                </option>
                            </select>
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
                            <input
                                name="category"
                                defaultValue={
                                    state.values
                                        .category
                                }
                                placeholder="Masalan: Imlo"
                                required
                            />
                            <FieldError
                                message={
                                    state.fieldErrors
                                        .category
                                }
                            />
                        </label>
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
                                defaultValue={
                                    state.values
                                        .topicSlug
                                }
                                placeholder="imlo"
                                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                                required
                            />
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
                                defaultValue={
                                    state.values.slug
                                }
                                placeholder="2-tip"
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
                                defaultValue={
                                    state.values
                                        .format
                                }
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
                            </select>
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
                                defaultValue={
                                    state.values
                                        .difficulty
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
                            <FieldError
                                message={
                                    state.fieldErrors
                                        .difficulty
                                }
                            />
                        </label>
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
                                defaultValue={
                                    state.values
                                        .estimatedMinutes
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
