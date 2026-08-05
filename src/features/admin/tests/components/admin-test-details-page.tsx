import type {
    AdminTestDetails,
} from "@/features/admin/tests/model/admin-test-details";

import styles from "./admin-test-details-page.module.css";

interface AdminTestDetailsPageProps {
    readonly details:
        AdminTestDetails;
}

const groupLabels:
    Readonly<Record<string, string>> = {
        grammar: "Grammatika",
        "national-certificate":
            "Milliy sertifikat",
        morphology:
            "Morfologiya ichki testlari",
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

const difficultyLabels:
    Readonly<Record<string, string>> = {
        easy: "Oson",
        medium: "O‘rta",
        hard: "Qiyin",
    };

const typeLabels:
    Readonly<Record<string, string>> = {
        "multiple-choice":
            "Variantli savol",
        "short-answer":
            "Qisqa javob",
        "matching-group":
            "Moslashtirish",
        multipart:
            "Ko‘p qismli",
        essay:
            "Esse",
    };

export function AdminTestDetailsPage({
    details,
}: AdminTestDetailsPageProps) {
    const {
        test,
        questions,
    } = details;

    return (
        <>
            <header className={styles.header}>
                <div>
                    <a
                        href="/admin/tests"
                        className={styles.backLink}
                    >
                        ← Testlar katalogiga qaytish
                    </a>

                    <span className={styles.eyebrow}>
                        TEST TAFSILOTLARI
                    </span>

                    <h1>
                        {test.title}
                    </h1>

                    <p>
                        {test.description}
                    </p>
                </div>

                {test.hasDataset && (
                    <a
                        href={test.href}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.openTest}
                    >
                        Platformada ochish
                    </a>
                )}
            </header>

            <section className={styles.summaryGrid}>
                <article>
                    <span>
                        Holat
                    </span>
                    <strong>
                        {test.status === "active"
                            ? "Faol"
                            : "Rejalashtirilgan"}
                    </strong>
                </article>

                <article>
                    <span>
                        Savollar
                    </span>
                    <strong>
                        {test.questionCount}
                    </strong>
                </article>

                <article>
                    <span>
                        Maksimal ball
                    </span>
                    <strong>
                        {test.maximumScore ??
                            "—"}
                    </strong>
                </article>

                <article>
                    <span>
                        Vaqt
                    </span>
                    <strong>
                        {test.estimatedMinutes}
                        {" "}
                        daq.
                    </strong>
                </article>
            </section>

            <section className={styles.metadataCard}>
                <div className={styles.metadataHeader}>
                    <div>
                        <span>
                            TEST METADATA
                        </span>
                        <h2>
                            Asosiy ma’lumotlar
                        </h2>
                    </div>

                    <span
                        className={
                            test.hasDataset
                                ? styles.activeBadge
                                : styles.plannedBadge
                        }
                    >
                        {test.hasDataset
                            ? "Dataset mavjud"
                            : "Dataset mavjud emas"}
                    </span>
                </div>

                <dl className={styles.metadataGrid}>
                    <div>
                        <dt>
                            Test ID
                        </dt>
                        <dd>
                            {test.id}
                        </dd>
                    </div>

                    <div>
                        <dt>
                            Slug
                        </dt>
                        <dd>
                            {test.slug}
                        </dd>
                    </div>

                    <div>
                        <dt>
                            Guruh
                        </dt>
                        <dd>
                            {
                                groupLabels[
                                    test.group
                                ]
                            }
                        </dd>
                    </div>

                    <div>
                        <dt>
                            Kategoriya
                        </dt>
                        <dd>
                            {test.category}
                        </dd>
                    </div>

                    <div>
                        <dt>
                            Format
                        </dt>
                        <dd>
                            {
                                formatLabels[
                                    test.format
                                ] ??
                                test.format
                            }
                        </dd>
                    </div>

                    <div>
                        <dt>
                            Qiyinlik
                        </dt>
                        <dd>
                            {
                                difficultyLabels[
                                    test.difficulty
                                ]
                            }
                        </dd>
                    </div>

                    <div>
                        <dt>
                            Access
                        </dt>
                        <dd>
                            {test.access ===
                            "premium"
                                ? "Premium"
                                : "Bepul"}
                        </dd>
                    </div>

                    <div>
                        <dt>
                            Frontend route
                        </dt>
                        <dd>
                            {test.href}
                        </dd>
                    </div>

                    <div>
                        <dt>
                            Data source
                        </dt>
                        <dd>
                            {details.dataSource ??
                                "Ko‘rsatilmagan"}
                        </dd>
                    </div>

                    <div>
                        <dt>
                            Javob kaliti
                        </dt>
                        <dd>
                            {
                                details.answerKeyStatus ??
                                "Ko‘rsatilmagan"
                            }
                        </dd>
                    </div>
                </dl>
            </section>

            {!test.hasDataset ? (
                <section className={styles.noDatasetCard}>
                    <span>
                        DATASET KUTILMOQDA
                    </span>

                    <h2>
                        Bu test hali platformada
                        ishlamaydi
                    </h2>

                    <p>
                        Test rejalashtirilgan
                        katalogda mavjud, ammo uning
                        savollar dataset’i registry’ga
                        qo‘shilmagan. Shu sababli
                        savollar va javoblar
                        ko‘rsatilmaydi.
                    </p>
                </section>
            ) : (
                <section className={styles.questionsSection}>
                    <div className={styles.questionsHeader}>
                        <div>
                            <span>
                                SAVOLLAR DATASET’I
                            </span>

                            <h2>
                                Savollar ro‘yxati
                            </h2>
                        </div>

                        <strong>
                            {questions.length}
                            {" "}
                            ta yozuv
                        </strong>
                    </div>

                    {questions.length === 0 ? (
                        <div className={styles.emptyQuestions}>
                            Dataset mavjud, ammo
                            savollar avtomatik
                            ko‘rinishga keltirilmadi.
                        </div>
                    ) : (
                        <div className={styles.questionList}>
                            {questions.map(
                                (
                                    question,
                                    index,
                                ) => (
                                    <article
                                        key={`${question.id}:${index}`}
                                        className={styles.questionCard}
                                    >
                                        <div className={styles.questionTop}>
                                            <div>
                                                <span className={styles.questionNumber}>
                                                    {question.order}
                                                </span>

                                                <div>
                                                    <strong>
                                                        {
                                                            typeLabels[
                                                                question.type
                                                            ] ??
                                                            question.type
                                                        }
                                                    </strong>

                                                    <small>
                                                        ID: {question.id}
                                                        {question.sourceOrder
                                                            ? ` · Asl raqam: ${question.sourceOrder}`
                                                            : ""}
                                                    </small>
                                                </div>
                                            </div>

                                            <div className={styles.questionBadges}>
                                                <span>
                                                    {question.maximumScore ??
                                                        "—"}
                                                    {" "}
                                                    ball
                                                </span>

                                                <span
                                                    className={
                                                        question.hasAudio
                                                            ? styles.audioYes
                                                            : styles.audioNo
                                                    }
                                                >
                                                    {question.hasAudio
                                                        ? "Audio mavjud"
                                                        : "Audio yo‘q"}
                                                </span>
                                            </div>
                                        </div>

                                        <p className={styles.questionText}>
                                            {question.question}
                                        </p>

                                        {question.options.length >
                                            0 && (
                                            <div className={styles.optionGrid}>
                                                {question.options.map(
                                                    (
                                                        option,
                                                    ) => (
                                                        <div
                                                            key={`${question.id}:${option.id}`}
                                                            className={
                                                                option.id ===
                                                                question.correctAnswer
                                                                    ? styles.correctOption
                                                                    : styles.option
                                                            }
                                                        >
                                                            <strong>
                                                                {option.id}
                                                            </strong>

                                                            <span>
                                                                {option.text}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}

                                        <div className={styles.answerRow}>
                                            <span>
                                                To‘g‘ri javob
                                            </span>

                                            <strong>
                                                {question.correctAnswer ??
                                                    "Ko‘rsatilmagan"}
                                            </strong>
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    )}
                </section>
            )}
        </>
    );
}
