import dynamic from "next/dynamic";

import { TopicGrid } from "@/features/home/components/topic-grid";
import { FreeTestsCarousel } from "@/features/home/components/free-tests-carousel";
import { HomeFooter } from "@/features/home/components/home-footer";
import { HomeHeaderShell } from "@/features/home/components/home-header-shell";
import { HomeHeroCarousel } from "@/features/home/components/home-hero-carousel";
import { MobileNavigation } from "@/features/home/components/mobile-navigation";
import { ScrollToTop } from "@/features/home/components/scroll-to-top";
import { StudentModuleWarmup } from "@/features/home/components/student-module-warmup";

import styles from "./page.module.css";

const DeferredSection = () => (
    <div className={styles.deferredSectionPlaceholder} aria-hidden="true" />
);

const CatalogPromotionBanner = dynamic(
    () => import("@/features/home/components/catalog-promotion-banner")
        .then((module) => module.CatalogPromotionBanner),
    { loading: DeferredSection },
);
const CourseShowcase = dynamic(
    () => import("@/features/home/components/course-showcase")
        .then((module) => module.CourseShowcase),
    { loading: DeferredSection },
);
const BookShowcase = dynamic(
    () => import("@/features/home/components/book-showcase")
        .then((module) => module.BookShowcase),
    { loading: DeferredSection },
);
const DiagnosticBanner = dynamic(
    () => import("@/features/home/components/diagnostic-banner")
        .then((module) => module.DiagnosticBanner),
    { loading: DeferredSection },
);

export default function Home() {
    return (
        <main className={styles.page}>
            <HomeHeaderShell />
            <HomeHeroCarousel />
            <TopicGrid />
            <FreeTestsCarousel />
            <CatalogPromotionBanner />
            <CourseShowcase />
            <BookShowcase />
            <DiagnosticBanner />
            <HomeFooter />
            <ScrollToTop />
            <StudentModuleWarmup />
            <MobileNavigation />
        </main>
    );
}
