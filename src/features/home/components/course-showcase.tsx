"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getPublishedCourses } from "@/features/courses/model/course-catalog";
import type { CourseDefinition } from "@/features/courses/model/course-types";

import styles from "./course-showcase.module.css";

type CourseAccent = "grammar" | "analysis" | "essay";

function uiAccent(course: CourseDefinition): CourseAccent {
    if (course.slug.includes("esse")) return "essay";
    if (course.slug.includes("matn") || course.slug.includes("gazal")) return "analysis";
    return "grammar";
}

function imagePosition(course: CourseDefinition): string {
    if (course.slug === "milliy-sertifikat") return "center 50%";
    if (course.slug.includes("esse")) return "center 69%";
    return "center 63%";
}

export function CourseShowcase() {
    const router = useRouter();
    const [courses, setCourses] = useState<readonly CourseDefinition[]>(getPublishedCourses());

    useEffect(() => {
        let cancelled = false;

        void fetch("/api/catalog/home", { cache: "no-store" })
            .then(async (response) => {
                if (!response.ok) return null;
                return response.json() as Promise<{ courses?: CourseDefinition[] }>;
            })
            .then((payload) => {
                if (!cancelled && Array.isArray(payload?.courses)) setCourses(payload.courses);
            })
            .catch(() => undefined);

        return () => { cancelled = true; };
    }, []);

    const visibleCourses = useMemo(() => courses.slice(0, 6), [courses]);

    return (
        <section className={styles.section} aria-labelledby="courses-heading">
            <header className={styles.heading}>
                <span>ONLINE TA’LIM</span>
                <h2 id="courses-heading">Tavsiya etilgan kurslar</h2>
                <p>Milliy sertifikat uchun kerakli yo‘nalishni tanlang va tizimli tayyorgarlikni boshlang.</p>
            </header>

            <div className={styles.list}>
                {visibleCourses.map((course, index) => {
                    const accent = uiAccent(course);
                    return (
                        <article key={course.id} className={`${styles.card} ${styles[accent]}`}>
                            <button
                                className={styles.imageButton}
                                type="button"
                                aria-label={`${course.title} kursini ko‘rish`}
                                onClick={() => router.push(`/kurslar/${course.slug}`)}
                            >
                                <Image
                                    className={styles.image}
                                    src={course.coverImage}
                                    alt={course.coverImageAlt}
                                    fill
                                    priority={index === 0}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    sizes="(max-width: 599px) 100vw, 448px"
                                    style={{ objectPosition: imagePosition(course) }}
                                />
                                <div className={styles.imageOverlay} aria-hidden="true" />
                                <div className={styles.imageTopRow}>
                                    <span className={styles.badge}>{course.badge}</span>
                                    <span className={styles.imageArrow} aria-hidden="true">→</span>
                                </div>
                                <span className={styles.imageLabel}>TA’LIMOT KURSI</span>
                            </button>

                            <div className={styles.content}>
                                <div className={styles.copy}>
                                    <h3>{course.title}</h3>
                                    <p>{course.shortDescription}</p>
                                </div>
                                <div className={styles.meta}>
                                    {course.benefits.slice(0, 2).map((item) => (
                                        <span key={item}><span className={styles.metaCheck} aria-hidden="true">✓</span>{item}</span>
                                    ))}
                                </div>
                                <button className={styles.courseButton} type="button" onClick={() => router.push(`/kurslar/${course.slug}`)}>
                                    <span>Kursni ko‘rish</span><span className={styles.buttonIcon} aria-hidden="true">→</span>
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
