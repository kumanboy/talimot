"use client";

import Image from "next/image";
import {
    useRouter,
} from "next/navigation";

import {
    MobileNavigation,
} from "@/features/home/components/mobile-navigation";

import type {
    CourseDefinition,
} from "@/features/courses/model/course-types";

import {
    CourseSaleCountdown,
} from "./course-sale-countdown";

import styles from "./courses-page.module.css";

type CoursesPageProps = {
    readonly courses:
        readonly CourseDefinition[];
};

function formatPrice(value: number): string {
    return `${new Intl.NumberFormat("uz-UZ").format(value)} so‘m`;
}

export function CoursesPage({
    courses,
}: CoursesPageProps) {
    const router = useRouter();

    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <button
                        type="button"
                        aria-label="Bosh sahifaga qaytish"
                        onClick={() => router.replace("/")}
                    >
                        ←
                    </button>

                    <div>
                        <span>TA’LIMOT KURSLARI</span>
                        <strong>Kurslar</strong>
                    </div>
                </header>

                <section className={styles.hero}>
                    <span>CHEKLANMAGAN FOYDALANISH</span>
                    <h1>O‘zingizga mos kursni tanlang</h1>
                    <p>
                        Sardor Toshmuhammadov darslari,
                        yopiq Telegram kanali va video-audio
                        materiallar bilan tizimli tayyorlaning.
                    </p>
                </section>

                <section
                    className={styles.courseList}
                    aria-label="Kurslar ro‘yxati"
                >
                    {courses.map((course) => (
                        <article
                            key={course.id}
                            className={`${styles.card} ${styles[course.accent]}`}
                        >
                            <button
                                type="button"
                                className={styles.coverButton}
                                aria-label={`${course.title} haqida batafsil ma’lumot`}
                                onClick={() =>
                                    router.push(
                                        `/kurslar/${course.slug}`,
                                    )
                                }
                            >
                                <Image
                                    src={course.coverImage}
                                    alt={course.coverImageAlt}
                                    fill
                                    sizes="(max-width: 599px) 100vw, 448px"
                                    className={styles.coverImage}
                                />

                                <span className={styles.badge}>
                                    {course.badge}
                                </span>
                            </button>

                            <div className={styles.cardContent}>
                                <h2>{course.title}</h2>
                                <p>{course.shortDescription}</p>

                                <div className={styles.priceRow}>
                                    <div>
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

                                    <span>
                                        {course.accessDurationLabel}
                                    </span>
                                </div>

                                <CourseSaleCountdown
                                    endsAt={course.sale.endsAt}
                                />

                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={() =>
                                        router.push(
                                            `/kurslar/${course.slug}`,
                                        )
                                    }
                                >
                                    Kursni ko‘rish
                                    <span aria-hidden="true">→</span>
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            </div>

            <MobileNavigation />
        </main>
    );
}
