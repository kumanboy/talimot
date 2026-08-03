"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import styles from "./course-showcase.module.css";

type CourseAccent =
    | "grammar"
    | "analysis"
    | "essay";

type Course = {
    id: string;
    title: string;
    description: string;
    badge: string;
    meta: readonly string[];
    href: string;
    image: string;
    imageAlt: string;
    accent: CourseAccent;
    imagePosition: string;
};

const courses: readonly Course[] = [
    {
        id: "grammar-course",
        title: "Grammatika kursi",
        description:
            "Fonetika, morfemika, morfologiya va sintaksisni tizimli o‘rganing.",
        badge: "ENG OMMABOP",
        meta: [
            "35 ta video dars",
            "120+ soat",
        ],
        href: "/kurslar/grammatika",
        image:
            "/images/home/courses/grammar-course.webp",
        imageAlt:
            "Ona tili grammatika kursi",
        accent: "grammar",
        imagePosition: "center 64%",
    },
    {
        id: "text-analysis-course",
        title: "G‘azal va matn tahlili",
        description:
            "G‘azal, badiiy va ilmiy matn savollarini tahlil qilishni o‘rganing.",
        badge: "TAVSIYA ETILADI",
        meta: [
            "20+ dars",
            "Amaliy tahlillar",
        ],
        href: "/kurslar/matn-tahlili",
        image:
            "/images/home/courses/text-analysis-course.webp",
        imageAlt:
            "G‘azal, badiiy va ilmiy matn tahlili kursi",
        accent: "analysis",
        imagePosition: "center 63%",
    },
    {
        id: "essay-course",
        title: "Esse yozish kursi",
        description:
            "Kirish, asosiy qism, dalillash va kuchli xulosa yozishni o‘zlashtiring.",
        badge: "YANGI",
        meta: [
            "Bosqichma-bosqich",
            "Tekshiruv bilan",
        ],
        href: "/kurslar/esse",
        image:
            "/images/home/courses/essay-course.webp",
        imageAlt:
            "Milliy sertifikat uchun esse yozish kursi",
        accent: "essay",
        imagePosition: "center 69%",
    },
];

export function CourseShowcase() {
    const router = useRouter();

    const openCourse = (href: string) => {
        router.push(href);
    };

    return (
        <section
            className={styles.section}
            aria-labelledby="courses-heading"
        >
            <header className={styles.heading}>
                <span>ONLINE TA’LIM</span>

                <h2 id="courses-heading">
                    Tavsiya etilgan kurslar
                </h2>

                <p>
                    Milliy sertifikat uchun kerakli
                    yo‘nalishni tanlang va tizimli
                    tayyorgarlikni boshlang.
                </p>
            </header>

            <div className={styles.list}>
                {courses.map((course,index) => (
                    <article
                        key={course.id}
                        className={`${styles.card} ${
                            styles[course.accent]
                        }`}
                    >
                        <button
                            className={styles.imageButton}
                            type="button"
                            aria-label={`${course.title} kursini ko‘rish`}
                            onClick={() =>
                                openCourse(course.href)
                            }
                        >
                            <Image
                                className={styles.image}
                                src={course.image}
                                alt={course.imageAlt}
                                fill
                                priority={index === 0}
                                loading={index === 0 ? "eager" : "lazy"}
                                sizes="(max-width: 599px) 100vw, 448px"
                                style={{
                                    objectPosition: course.imagePosition,
                                }}
                            />

                            <div
                                className={styles.imageOverlay}
                                aria-hidden="true"
                            />

                            <div className={styles.imageTopRow}>
                <span className={styles.badge}>
                  {course.badge}
                </span>

                                <span
                                    className={styles.imageArrow}
                                    aria-hidden="true"
                                >
                  →
                </span>
                            </div>

                            <span className={styles.imageLabel}>
                TA’LIMOT KURSI
              </span>
                        </button>

                        <div className={styles.content}>
                            <div className={styles.copy}>
                                <h3>{course.title}</h3>

                                <p>{course.description}</p>
                            </div>

                            <div className={styles.meta}>
                                {course.meta.map((item) => (
                                    <span key={item}>
                    <span
                        className={styles.metaCheck}
                        aria-hidden="true"
                    >
                      ✓
                    </span>

                                        {item}
                  </span>
                                ))}
                            </div>

                            <button
                                className={styles.courseButton}
                                type="button"
                                onClick={() =>
                                    openCourse(course.href)
                                }
                            >
                                <span>Kursni ko‘rish</span>

                                <span
                                    className={styles.buttonIcon}
                                    aria-hidden="true"
                                >
                  →
                </span>
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}