"use client";

import Link from "next/link";
import {
    useMemo,
    useState,
} from "react";

import {
    deleteAdminTestDraftAction,
} from "@/features/admin/tests/draft/actions/delete-admin-test-draft-action";
import type {
    AdminTestDraftAccess,
    AdminTestDraftGroup,
    AdminTestDraftStatus,
    AdminTestDraftSummary,
} from "@/features/admin/tests/draft/model";

import styles from "./admin-tests-page.module.css";
import draftStyles from "./admin-tests-drafts.module.css";

type GroupFilter =
    | "all"
    | AdminTestDraftGroup;

type StatusFilter =
    | "all"
    | AdminTestDraftStatus;

type AccessFilter =
    | "all"
    | AdminTestDraftAccess;

interface AdminTestsPageProps {
    readonly records:
        readonly AdminTestDraftSummary[];
    readonly total: number;
}

const groupLabels:
    Readonly<Record<AdminTestDraftGroup, string>> = {
        grammar: "Grammatika",
        "national-certificate":
            "Milliy sertifikat",
        morphology:
            "Morfologiya ichki testlari",
    };

const statusLabels:
    Readonly<Record<AdminTestDraftStatus, string>> = {
        draft: "Draft",
        review: "Tekshiruvda",
        published: "Published",
        archived: "Arxivlangan",
    };

const accessLabels:
    Readonly<Record<AdminTestDraftAccess, string>> = {
        free: "Bepul",
        premium: "Premium",
    };

const formatLabels:
    Readonly<Record<string, string>> = {
        standard: "Standart",
        "passage-five":
            "Matn + 5 savol",
        "standard-five":
            "5 ta savol",
        mixed: "Aralash",
        diagnostic:
            "To‘liq imtihon",
        "morphology-standard":
            "Morfologiya",
    };

function normalizeSearch(
    value: string,
): string {
    return value
        .trim()
        .toLocaleLowerCase("uz");
}

function studentHref(
    record:
        AdminTestDraftSummary,
): string {
    if (
        record.group ===
        "national-certificate"
    ) {
        return `/tests/milliy-sertifikat/${record.topicSlug}/${record.slug}`;
    }

    if (
        record.group ===
        "morphology"
    ) {
        return `/tests/grammatika/morfologiya/${record.topicSlug}/${record.slug}`;
    }

    return `/tests/grammatika/${record.topicSlug}/${record.slug}`;
}

export function AdminTestsPage({
    records,
    total,
}: AdminTestsPageProps) {
    const [
        search,
        setSearch,
    ] = useState("");
    const [
        group,
        setGroup,
    ] = useState<GroupFilter>(
        "all",
    );
    const [
        status,
        setStatus,
    ] = useState<StatusFilter>(
        "all",
    );
    const [
        access,
        setAccess,
    ] = useState<AccessFilter>(
        "all",
    );

    const filteredRecords =
        useMemo(() => {
            const normalizedSearch =
                normalizeSearch(
                    search,
                );

            return records.filter(
                (record) => {
                    const matchesSearch =
                        normalizedSearch.length ===
                            0 ||
                        [
                            record.title,
                            record.description,
                            record.category,
                            record.topicSlug,
                            record.slug,
                            record.id,
                        ]
                            .join(" ")
                            .toLocaleLowerCase(
                                "uz",
                            )
                            .includes(
                                normalizedSearch,
                            );
                    const matchesGroup =
                        group === "all" ||
                        record.group ===
                            group;
                    const matchesStatus =
                        status === "all" ||
                        record.status ===
                            status;
                    const matchesAccess =
                        access === "all" ||
                        record.access ===
                            access;

                    return (
                        matchesSearch &&
                        matchesGroup &&
                        matchesStatus &&
                        matchesAccess
                    );
                },
            );
        }, [
            access,
            group,
            records,
            search,
            status,
        ]);

    const publishedCount =
        records.filter(
            (record) =>
                record.status ===
                "published",
        ).length;
    const draftCount =
        records.filter(
            (record) =>
                record.status ===
                "draft",
        ).length;
    const reviewCount =
        records.filter(
            (record) =>
                record.status ===
                "review",
        ).length;

    return (
        <>
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>
                        TA’LIMOT ADMIN
                    </span>
                    <h1>
                        Testlar boshqaruvi
                    </h1>
                    <p>
                        Database’dagi real testlar va draftlarni boshqaring.
                        Student UI faqat Published testlarni ko‘rsatadi.
                    </p>
                </div>

                <div className={draftStyles.headerActions}>
                    <Link
                        href="/admin/tests/new"
                        className={draftStyles.createButton}
                    >
                        + Yangi test yaratish
                    </Link>
                    <a
                        href="/tests"
                        target="_blank"
                        rel="noreferrer"
                        className={styles.openPlatform}
                    >
                        Student testlarini ochish
                    </a>
                </div>
            </header>

            <section
                className={styles.statsGrid}
                aria-label="Database testlari statistikasi"
            >
                <article>
                    <span>Jami DB</span>
                    <strong>{total}</strong>
                </article>
                <article>
                    <span>Published</span>
                    <strong>{publishedCount}</strong>
                </article>
                <article>
                    <span>Draft</span>
                    <strong>{draftCount}</strong>
                </article>
                <article>
                    <span>Tekshiruvda</span>
                    <strong>{reviewCount}</strong>
                </article>
            </section>

            <section className={styles.catalogCard}>
                <div className={styles.filters}>
                    <label className={styles.searchField}>
                        <span>Qidiruv</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Test nomi, kategoriya, slug yoki ID..."
                        />
                    </label>

                    <label>
                        <span>Guruh</span>
                        <select
                            value={group}
                            onChange={(event) =>
                                setGroup(
                                    event.target.value as
                                        GroupFilter,
                                )
                            }
                        >
                            <option value="all">Barchasi</option>
                            <option value="grammar">Grammatika</option>
                            <option value="morphology">Morfologiya</option>
                            <option value="national-certificate">Milliy sertifikat</option>
                        </select>
                    </label>

                    <label>
                        <span>Holat</span>
                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value as
                                        StatusFilter,
                                )
                            }
                        >
                            <option value="all">Barchasi</option>
                            <option value="draft">Draft</option>
                            <option value="review">Tekshiruvda</option>
                            <option value="published">Published</option>
                            <option value="archived">Arxivlangan</option>
                        </select>
                    </label>

                    <label>
                        <span>Access</span>
                        <select
                            value={access}
                            onChange={(event) =>
                                setAccess(
                                    event.target.value as
                                        AccessFilter,
                                )
                            }
                        >
                            <option value="all">Barchasi</option>
                            <option value="free">Bepul</option>
                            <option value="premium">Premium</option>
                        </select>
                    </label>
                </div>

                <div className={styles.resultBar}>
                    <strong>{filteredRecords.length}</strong>
                    <span>ta database yozuvi ko‘rsatildi</span>
                </div>

                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>Test / draft</th>
                                <th>Guruh</th>
                                <th>Format</th>
                                <th>Savollar</th>
                                <th>Ball</th>
                                <th>Vaqt</th>
                                <th>Access</th>
                                <th>Holat</th>
                                <th>Yangilangan</th>
                                <th>Amal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map(
                                (record) => (
                                    <tr key={record.id}>
                                        <td>
                                            <div className={styles.testTitle}>
                                                <strong>{record.title}</strong>
                                                <span>
                                                    {record.category}
                                                    {" · "}
                                                    {record.topicSlug}/{record.slug}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{groupLabels[record.group]}</td>
                                        <td>
                                            {formatLabels[record.format] ??
                                                record.format}
                                        </td>
                                        <td>{record.questionCount}</td>
                                        <td>{record.maximumScore}</td>
                                        <td>{record.estimatedMinutes} daq.</td>
                                        <td>
                                            <span
                                                className={
                                                    record.access ===
                                                    "premium"
                                                        ? styles.premiumBadge
                                                        : styles.freeBadge
                                                }
                                            >
                                                {accessLabels[record.access]}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`${draftStyles.statusBadge} ${
                                                    draftStyles[
                                                        `status_${record.status}`
                                                    ]
                                                }`}
                                            >
                                                {statusLabels[record.status]}
                                            </span>
                                        </td>
                                        <td>
                                            {new Date(
                                                record.updatedAt,
                                            ).toLocaleString("uz-UZ")}
                                        </td>
                                        <td>
                                            <div className={draftStyles.rowActions}>
                                                <Link
                                                    href={`/admin/tests/${encodeURIComponent(
                                                        record.id,
                                                    )}/edit`}
                                                    className={draftStyles.editButton}
                                                >
                                                    {record.status ===
                                                    "published"
                                                        ? "Ko‘rish"
                                                        : "Tahrirlash"}
                                                </Link>

                                                {record.status ===
                                                    "published" && (
                                                    <a
                                                        href={studentHref(
                                                            record,
                                                        )}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={styles.openTest}
                                                    >
                                                        Studentda ochish
                                                    </a>
                                                )}

                                                <form
                                                    action={deleteAdminTestDraftAction}
                                                    onSubmit={(event) => {
                                                        const message =
                                                            record.status ===
                                                            "published"
                                                                ? "Published test database’dan o‘chiriladi va student UI’dan ham yo‘qoladi. Davom etasizmi?"
                                                                : "Ushbu test/draft database’dan butunlay o‘chiriladi. Davom etasizmi?";

                                                        if (
                                                            !window.confirm(
                                                                message,
                                                            )
                                                        ) {
                                                            event.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    <input
                                                        type="hidden"
                                                        name="draftId"
                                                        value={record.id}
                                                    />
                                                    <button
                                                        type="submit"
                                                        className={draftStyles.deleteButton}
                                                    >
                                                        O‘chirish
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ),
                            )}

                            {filteredRecords.length ===
                                0 && (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className={styles.emptyState}
                                    >
                                        Database’da mos test yoki draft topilmadi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <p className={styles.catalogNote}>
                    Bu sahifada faqat Supabase/PostgreSQL database yozuvlari
                    ko‘rsatiladi. Eski rejalashtirilgan statik/fake testlar
                    admin katalogiga qo‘shilmaydi.
                </p>
            </section>
        </>
    );
}
