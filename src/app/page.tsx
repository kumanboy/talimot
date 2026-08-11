"use client";

import Image from "next/image";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

import {TalimotLogo} from "@/components/brand/talimot-logo";
import {TopicGrid} from "@/features/home/components/topic-grid";
import {FreeTestsCarousel} from "@/features/home/components/free-tests-carousel";
import { CatalogPromotionBanner } from "@/features/home/components/catalog-promotion-banner";
import {CourseShowcase} from "@/features/home/components/course-showcase";
import {BookShowcase} from "@/features/home/components/book-showcase";
import { DiagnosticBanner } from "@/features/home/components/diagnostic-banner";
import { HomeFooter } from "@/features/home/components/home-footer";
import { HomeDrawer } from "@/features/home/components/home-drawer";
import { MobileNavigation } from "@/features/home/components/mobile-navigation";
import { ScrollToTop } from "@/features/home/components/scroll-to-top";
import { ThemeToggle } from "@/components/theme/theme-toggle";

import styles from "./page.module.css";


type Banner = {
    id: string;
    image: string;
    alt: string;
    href: string;
    external?: boolean;
};


const banners: Banner[] = [
    {
        id: "course-sale",
        image: "/images/home/banner1.png",
        alt: "TA’LIMOT kurslariga 30 foizgacha chegirma",
        href: "/kurslar",
    },
    {
        id: "free-mock",
        image: "/images/home/banner2.png",
        alt: "Bepul milliy sertifikat mock imtihoni",
        href: "/tests?type=mock",
    },
    {
        id: "telegram",
        image: "/images/home/banner3.png",
        alt: "TA’LIMOT Telegram kanaliga qo‘shilish",
        href: "https://t.me/sardortoshmuhammad_onatili",
        external: true,
    },
    {
        id: "instagram",
        image: "/images/home/banner4.png",
        alt: "Sardor Toshmuhammadov Instagram sahifasiga obuna bo‘lish",
        href: "https://www.instagram.com/sardor_toshmuhammadov/",
        external: true,
    },
    {
        id: "topic-tests",
        image: "/images/home/banner5.png",
        alt: "Bepul mavzulashtirilgan ona tili testlari",
        href: "/tests",
    },
];


export default function Home() {
    const router = useRouter();

    const [activeBanner, setActiveBanner] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setActiveBanner((currentBanner) =>
                currentBanner === banners.length - 1
                    ? 0
                    : currentBanner + 1,
            );
        }, 6000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen
            ? "hidden"
            : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isMenuOpen]);

    const openDestination = (
        href: string,
        external = false,
    ) => {
        if (external) {
            window.open(
                href,
                "_blank",
                "noopener,noreferrer",
            );
            return;
        }

        router.push(href);
    };



    const activeBannerData = banners[activeBanner];

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <TalimotLogo/>

                <div className={styles.headerActions}>
                    <button
                        className={styles.notificationButton}
                        type="button"
                        aria-label="Bildirishnomalar"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        <span aria-hidden="true"/>
                    </button>

                    <ThemeToggle />
                    <button
                        className={styles.menuButton}
                        type="button"
                        aria-label="Menyuni ochish"
                        aria-expanded={isMenuOpen}
                        aria-controls="home-navigation-drawer"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <span/>
                        <span/>
                        <span/>
                    </button>
                </div>
            </header>

            <section
                className={styles.heroSection}
                aria-label="Asosiy takliflar"
            >
                <button
                    key={activeBannerData.id}
                    className={styles.heroBanner}
                    type="button"
                    aria-label={activeBannerData.alt}
                    onClick={() =>
                        openDestination(
                            activeBannerData.href,
                            activeBannerData.external,
                        )
                    }
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

                <div
                    className={styles.carouselDots}
                    aria-label="Banner tanlash"
                >
                    {banners.map((banner, index) => (
                        <button
                            key={banner.id}
                            type="button"
                            className={
                                index === activeBanner
                                    ? styles.activeDot
                                    : undefined
                            }
                            aria-label={`${index + 1}-banner`}
                            aria-current={
                                index === activeBanner
                                    ? "true"
                                    : undefined
                            }
                            onClick={() => setActiveBanner(index)}
                        />
                    ))}
                </div>
            </section>

            <TopicGrid/>
            <FreeTestsCarousel/>
            <CatalogPromotionBanner/>
            <CourseShowcase/>
            <BookShowcase />
            <DiagnosticBanner />
            <HomeFooter />
            <ScrollToTop />
            <MobileNavigation />
            <HomeDrawer
                isOpen={isMenuOpen}
                onCloseAction={() =>
                    setIsMenuOpen(false)
                }
            />
        </main>
    );
}