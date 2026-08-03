"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import styles from "./promotion-banner.module.css";

type PromotionBannerProps = {
    badge: string;
    title: string;
    highlight: string;
    description: string;
    actionLabel: string;
    href: string;
    imageSrc: string;
    imageAlt: string;
    note?: string;
};

export function PromotionBanner({
                                    badge,
                                    title,
                                    highlight,
                                    actionLabel,
                                    href,
                                    imageSrc,
                                    imageAlt,

                                }: PromotionBannerProps) {
    const router = useRouter();

    return (
        <section
            className={styles.banner}
            aria-labelledby="course-promotion-title"
        >
            <Image
                className={styles.backgroundImage}
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 599px) 100vw, 480px"
            />

            <div
                className={styles.overlay}
                aria-hidden="true"
            />

            <div className={styles.content}>
        <span className={styles.badge}>
          {badge}
        </span>

                <h2 id="course-promotion-title">
                    {title}
                </h2>

                <strong className={styles.highlight}>
                    {highlight}
                </strong>

                <button
                    type="button"
                    onClick={() => router.push(href)}
                >
                    <span>{actionLabel}</span>

                    <span
                        className={styles.buttonIcon}
                        aria-hidden="true"
                    >
            →
          </span>
                </button>

            </div>
        </section>
    );
}