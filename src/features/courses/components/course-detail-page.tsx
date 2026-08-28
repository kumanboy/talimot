"use client";

import Image from "next/image";
import {
    MobileNavigation,
} from "@/features/home/components/mobile-navigation";
import { PendingNavigationButton } from "@/components/ui/pending-navigation-button";

import type {
    CourseDefinition,
    CourseLessonType,
} from "@/features/courses/model/course-types";

import {
    CourseSaleCountdown,
} from "./course-sale-countdown";

import styles from "./course-detail-page.module.css";

type CourseDetailPageProps = {
    readonly course: CourseDefinition;
};

const lessonTypeLabels: Readonly<
    Record<CourseLessonType, string>
> = {
    live: "Jonli dars",
    video: "Video dars",
    audio: "Audio dars",
    material: "Material",
};

function formatPrice(value: number): string {
    return `${new Intl.NumberFormat("uz-UZ").format(value)} so‘m`;
}

export function CourseDetailPage({
    course,
}: CourseDetailPageProps) {
    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <PendingNavigationButton mode="replace" href="/kurslar" aria-label="Kurslarga qaytish" pendingText="">
                        ←
                    </PendingNavigationButton>

                    <div>
                        <span>TA’LIMOT KURSI</span>
                        <strong>{course.title}</strong>
                    </div>
                </header>

                <section className={styles.heroCard}>
                    <div className={styles.cover}>
                        <Image
                            src={course.coverImage}
                            alt={course.coverImageAlt}
                            fill
                            priority
                            sizes="(max-width: 599px) 100vw, 448px"
                        />
                        <span>{course.badge}</span>
                    </div>

                    <div className={styles.heroContent}>
                        <span className={styles.eyebrow}>
                            {course.accessDurationLabel}
                        </span>
                        <h1>{course.title}</h1>
                        <p>{course.shortDescription}</p>

                        <div className={styles.priceBlock}>
                            <del>
                                {formatPrice(
                                    course.sale.originalPrice,
                                )}
                            </del>
                            <strong>
                                {formatPrice(
                                    course.sale.salePrice,
                                )}
                            </strong>
                        </div>

                        <CourseSaleCountdown
                            endsAt={course.sale.endsAt}
                        />

                        <PendingNavigationButton
                            mode="push"
                            href={`/kurslar/${course.slug}/sotib-olish`}
                            className={styles.purchaseButton}
                            pendingText="Ochilmoqda..."
                        >
                            Sotib olish
                            <span aria-hidden="true">→</span>
                        </PendingNavigationButton>
                    </div>
                </section>

                <section className={styles.section}>
                    <span className={styles.sectionLabel}>
                        KURS HAQIDA
                    </span>
                    <h2>Batafsil ma’lumot</h2>
                    {course.fullDescription.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </section>

                <section className={styles.infoGrid}>
                    <article>
                        <span>FORMAT</span>
                        <strong>{course.format}</strong>
                    </article>
                    <article>
                        <span>DARS JADVALI</span>
                        <strong>{course.schedule}</strong>
                    </article>
                    <article>
                        <span>TELEGRAM ORQALI KIRISH</span>
                        <strong>{course.accessDescription}</strong>
                    </article>
                </section>

                <section className={styles.section}>
                    <span className={styles.sectionLabel}>
                        O‘QITUVCHI
                    </span>
                    <h2>{course.instructor.name}</h2>
                    <strong className={styles.instructorRole}>
                        {course.instructor.role}
                    </strong>
                    <p>{course.instructor.biography}</p>
                </section>

                <section className={styles.section}>
                    <span className={styles.sectionLabel}>
                        KURS IMKONIYATLARI
                    </span>
                    <h2>Siz nimalarga ega bo‘lasiz?</h2>
                    <ul className={styles.benefits}>
                        {course.benefits.map((benefit) => (
                            <li key={benefit}>
                                <span aria-hidden="true">✓</span>
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className={styles.section}>
                    <span className={styles.sectionLabel}>
                        KURS DASTURI
                    </span>
                    <h2>Modullar va darslar</h2>
                    <div className={styles.modules}>
                        {course.modules.map((module) => (
                            <details key={module.id}>
                                <summary>
                                    <span>{module.title}</span>
                                    <small>
                                        {module.lessons.length} ta dars
                                    </small>
                                </summary>

                                {module.description ? (
                                    <p>{module.description}</p>
                                ) : null}

                                <div>
                                    {module.lessons.map((lesson) => (
                                        <article key={lesson.id}>
                                            <span>
                                                {lessonTypeLabels[lesson.type]}
                                            </span>
                                            <strong>{lesson.title}</strong>
                                            {lesson.durationLabel ? (
                                                <small>
                                                    {lesson.durationLabel}
                                                </small>
                                            ) : null}
                                        </article>
                                    ))}
                                </div>
                            </details>
                        ))}
                    </div>
                </section>
            </div>

            <div className={styles.stickyPurchase}>
                <div>
                    <del>
                        {formatPrice(course.sale.originalPrice)}
                    </del>
                    <strong>
                        {formatPrice(course.sale.salePrice)}
                    </strong>
                </div>
                <PendingNavigationButton
                    mode="push"
                    href={`/kurslar/${course.slug}/sotib-olish`}
                    pendingText="Ochilmoqda..."
                >
                    Sotib olish
                </PendingNavigationButton>
            </div>

            <MobileNavigation />
        </main>
    );
}
