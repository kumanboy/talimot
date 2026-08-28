"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "@/app/page.module.css";

type Banner = {
    id: string;
    image: string;
    alt: string;
    href: string;
    external?: boolean;
};

const banners: readonly Banner[] = [
    {
        id: "course-sale",
        image: "/images/home/banner1.webp",
        alt: "TA’LIMOT kurslariga 30 foizgacha chegirma",
        href: "/kurslar",
    },
    {
        id: "free-mock",
        image: "/images/home/banner2.webp",
        alt: "Bepul milliy sertifikat mock imtihoni",
        href: "/tests?type=mock",
    },
    {
        id: "telegram",
        image: "/images/home/banner3.webp",
        alt: "TA’LIMOT Telegram kanaliga qo‘shilish",
        href: "https://t.me/sardortoshmuhammad_onatili",
        external: true,
    },
    {
        id: "instagram",
        image: "/images/home/banner4.webp",
        alt: "Sardor Toshmuhammadov Instagram sahifasiga obuna bo‘lish",
        href: "https://www.instagram.com/sardor_toshmuhammadov/",
        external: true,
    },
    {
        id: "topic-tests",
        image: "/images/home/banner5.webp",
        alt: "Bepul mavzulashtirilgan ona tili testlari",
        href: "/tests",
    },
];

export function HomeHeroCarousel() {
    const router = useRouter();
    const [activeBanner, setActiveBanner] = useState(0);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setActiveBanner((currentBanner) =>
                currentBanner === banners.length - 1
                    ? 0
                    : currentBanner + 1,
            );
        }, 6000);

        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const active = banners[activeBanner];
        if (!active.external) router.prefetch(active.href);

        const next = banners[(activeBanner + 1) % banners.length];
        if (!next.external) router.prefetch(next.href);
    }, [activeBanner, router]);

    const activeBannerData = banners[activeBanner];

    const openDestination = () => {
        if (activeBannerData.external) {
            window.open(activeBannerData.href, "_blank", "noopener,noreferrer");
            return;
        }

        router.push(activeBannerData.href);
    };

    return (
        <section className={styles.heroSection} aria-label="Asosiy takliflar">
            <button
                key={activeBannerData.id}
                className={styles.heroBanner}
                type="button"
                aria-label={activeBannerData.alt}
                onClick={openDestination}
            >
                <Image
                    className={styles.heroBannerImage}
                    src={activeBannerData.image}
                    alt={activeBannerData.alt}
                    fill
                    priority={activeBanner === 0}
                    sizes="(max-width: 599px) 100vw, 480px"
                />
            </button>

            <div className={styles.carouselDots} aria-label="Banner tanlash">
                {banners.map((banner, index) => (
                    <button
                        key={banner.id}
                        type="button"
                        className={index === activeBanner ? styles.activeDot : undefined}
                        aria-label={`${index + 1}-banner`}
                        aria-current={index === activeBanner ? "true" : undefined}
                        onClick={() => setActiveBanner(index)}
                    />
                ))}
            </div>
        </section>
    );
}
