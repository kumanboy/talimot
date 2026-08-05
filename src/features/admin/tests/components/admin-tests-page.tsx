"use client";

import Link from "next/link";

import {
    useMemo,
    useState,
} from "react";

import type {
    AdminTestAccess,
    AdminTestCatalogItem,
    AdminTestGroup,
    AdminTestStatus,
} from "@/features/admin/tests/model/admin-test-catalog";

import type {
    AdminTestDraftSummary,
} from "@/features/admin/tests/draft/model";

import styles from "./admin-tests-page.module.css";
import draftStyles from "./admin-tests-drafts.module.css";

type GroupFilter =
    | "all"
    | AdminTestGroup;

type StatusFilter =
    | "all"
    | AdminTestStatus;

type AccessFilter =
    | "all"
    | AdminTestAccess;

interface AdminTestsPageProps {
    readonly tests:
        readonly AdminTestCatalogItem[];
    readonly stats: {
        readonly total: number;
        readonly active: number;
        readonly planned: number;
        readonly premium: number;
    };
    readonly drafts:
        readonly AdminTestDraftSummary[];
    readonly draftTotal:
        number;
}

const groupLabels:
    Readonly<Record<AdminTestGroup, string>> = {
        grammar: "Grammatika",
        "national-certificate":
            "Milliy sertifikat",
        morphology:
            "Morfologiya ichki testlari",
    };

const statusLabels:
    Readonly<Record<AdminTestStatus, string>> = {
        active: "Faol",
        planned: "Rejalashtirilgan",
    };

const accessLabels:
    Readonly<Record<AdminTestAccess, string>> = {
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

export function AdminTestsPage({
    tests,
    stats,
    drafts,
    draftTotal,
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

    const filteredTests =
        useMemo(() => {
            const normalizedSearch =
                normalizeSearch(search);

            return tests.filter(
                (test) => {
                    const matchesSearch =
                        normalizedSearch.length ===
                            0 ||
                        [
                            test.title,
                            test.description,
                            test.category,
                            test.topicSlug,
                            test.id,
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
                        test.group === group;

                    const matchesStatus =
                        status === "all" ||
                        test.status === status;

                    const matchesAccess =
                        access === "all" ||
                        test.access === access;

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
            search,
            status,
            tests,
        ]);

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
                        Platformadagi mavjud va
                        rejalashtirilgan testlarni
                        bitta katalogda kuzating.
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
                        Testlar sahifasini ochish
                    </a>
                </div>
            </header>

            <section
                className={styles.statsGrid}
                aria-label="Testlar statistikasi"
            >
                <article>
                    <span>
                        Jami testlar
                    </span>
                    <strong>
                        {stats.total}
                    </strong>
                </article>

                <article>
                    <span>
                        Faol
                    </span>
                    <strong>
                        {stats.active}
                    </strong>
                </article>

                <article>
                    <span>
                        Rejalashtirilgan
                    </span>
                    <strong>
                        {stats.planned}
                    </strong>
                </article>

                <article>
                    <span>
                        Premium
                    </span>
                    <strong>
                        {stats.premium}
                    </strong>
                </article>
            </section>

            <section className={styles.catalogCard}>
                <div className={styles.filters}>
                    <label className={styles.searchField}>
                        <span>
                            Qidiruv
                        </span>

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Test nomi, kategoriya yoki ID..."
                        />
                    </label>

                    <label>
                        <span>
                            Guruh
                        </span>

                        <select
                            value={group}
                            onChange={(event) =>
                                setGroup(
                                    event.target
                                        .value as
                                        GroupFilter,
                                )
                            }
                        >
                            <option value="all">
                                Barchasi
                            </option>
                            <option value="grammar">
                                Grammatika
                            </option>
                            <option value="national-certificate">
                                Milliy sertifikat
                            </option>
                            <option value="morphology">
                                Morfologiya
                            </option>
                        </select>
                    </label>

                    <label>
                        <span>
                            Holat
                        </span>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target
                                        .value as
                                        StatusFilter,
                                )
                            }
                        >
                            <option value="all">
                                Barchasi
                            </option>
                            <option value="active">
                                Faol
                            </option>
                            <option value="planned">
                                Rejalashtirilgan
                            </option>
                        </select>
                    </label>

                    <label>
                        <span>
                            Access
                        </span>

                        <select
                            value={access}
                            onChange={(event) =>
                                setAccess(
                                    event.target
                                        .value as
                                        AccessFilter,
                                )
                            }
                        >
                            <option value="all">
                                Barchasi
                            </option>
                            <option value="free">
                                Bepul
                            </option>
                            <option value="premium">
                                Premium
                            </option>
                        </select>
                    </label>
                </div>

                <div className={styles.resultBar}>
                    <strong>
                        {filteredTests.length}
                    </strong>

                    <span>
                        ta test ko‘rsatildi
                    </span>
                </div>

                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>Test</th>
                                <th>Guruh</th>
                                <th>Format</th>
                                <th>Savollar</th>
                                <th>Ball</th>
                                <th>Vaqt</th>
                                <th>Access</th>
                                <th>Holat</th>
                                <th>Amal</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredTests.map(
                                (test) => (
                                    <tr key={`${test.group}:${test.id}`}>
                                        <td>
                                            <div className={styles.testTitle}>
                                                <strong>
                                                    {test.title}
                                                </strong>

                                                <span>
                                                    {test.category}
                                                    {" · "}
                                                    {test.id}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            {
                                                groupLabels[
                                                    test.group
                                                ]
                                            }
                                        </td>

                                        <td>
                                            {
                                                formatLabels[
                                                    test.format
                                                ] ??
                                                test.format
                                            }
                                        </td>

                                        <td>
                                            {test.questionCount}
                                        </td>

                                        <td>
                                            {test.maximumScore ??
                                                "—"}
                                        </td>

                                        <td>
                                            {
                                                test.estimatedMinutes
                                            }{" "}
                                            daq.
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    test.access ===
                                                    "premium"
                                                        ? styles.premiumBadge
                                                        : styles.freeBadge
                                                }
                                            >
                                                {
                                                    accessLabels[
                                                        test.access
                                                    ]
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    test.status ===
                                                    "active"
                                                        ? styles.activeBadge
                                                        : styles.plannedBadge
                                                }
                                            >
                                                {
                                                    statusLabels[
                                                        test.status
                                                    ]
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            <div className={styles.actions}>
                                                <a
                                                    href={test.detailsHref}
                                                    className={styles.detailsLink}
                                                >
                                                    Batafsil
                                                </a>

                                                {test.hasDataset && (
                                                    <a
                                                        href={test.href}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={styles.openTest}
                                                    >
                                                        Ochish
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ),
                            )}

                            {filteredTests.length ===
                                0 && (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className={styles.emptyState}
                                    >
                                        Tanlangan filtrlarga
                                        mos test topilmadi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <p className={styles.catalogNote}>
                    Faol holat registry’da real
                    savollar dataset’i mavjudligini
                    bildiradi. Rejalashtirilgan
                    testlar katalogda bor, lekin
                    hali platformada ochilmaydi.
                </p>
            </section>

            <section className={draftStyles.draftsSection}>
                <div className={draftStyles.draftsHeader}>
                    <div>
                        <span>SUPABASE DRAFTLARI</span>
                        <h2>Yaratilgan test draftlari</h2>
                        <p>
                            Admin panel orqali yaratilgan va hali publish
                            qilinmagan testlarni boshqaring.
                        </p>
                    </div>

                    <div className={draftStyles.draftCount}>
                        <strong>{draftTotal}</strong>
                        <span>jami draft</span>
                    </div>
                </div>

                {drafts.length > 0 ? (
                    <div className={draftStyles.draftTableWrap}>
                        <table className={draftStyles.draftTable}>
                            <thead>
                                <tr>
                                    <th>Draft</th>
                                    <th>Guruh</th>
                                    <th>Format</th>
                                    <th>Savollar</th>
                                    <th>Ball</th>
                                    <th>Holat</th>
                                    <th>Yangilangan</th>
                                    <th>Amal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drafts.map((draft) => (
                                    <tr key={draft.id}>
                                        <td>
                                            <div className={draftStyles.draftTitle}>
                                                <strong>{draft.title}</strong>
                                                <span>{draft.id}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {draft.group === "grammar"
                                                ? "Grammatika"
                                                : "Milliy sertifikat"}
                                        </td>
                                        <td>
                                            {formatLabels[draft.format] ??
                                                draft.format}
                                        </td>
                                        <td>{draft.questionCount}</td>
                                        <td>{draft.maximumScore}</td>
                                        <td>
                                            <span
                                                className={`${draftStyles.statusBadge} ${
                                                    draftStyles[
                                                        `status_${draft.status}`
                                                    ]
                                                }`}
                                            >
                                                {draft.status === "draft"
                                                    ? "Draft"
                                                    : draft.status === "review"
                                                      ? "Tekshiruvda"
                                                      : draft.status === "published"
                                                        ? "Published"
                                                        : "Arxivlangan"}
                                            </span>
                                        </td>
                                        <td>
                                            {new Date(
                                                draft.updatedAt,
                                            ).toLocaleString("uz-UZ")}
                                        </td>
                                        <td>
                                            <Link
                                                href={`/admin/tests/${encodeURIComponent(
                                                    draft.id,
                                                )}/edit`}
                                                className={draftStyles.editButton}
                                            >
                                                Tahrirlash
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={draftStyles.emptyDrafts}>
                        <strong>Hali draft yaratilmagan</strong>
                        <p>
                            Birinchi test draftini yaratish uchun tugmani bosing.
                        </p>
                        <Link
                            href="/admin/tests/new"
                            className={draftStyles.createButton}
                        >
                            + Yangi test yaratish
                        </Link>
                    </div>
                )}
            </section>
        </>
    );
}
