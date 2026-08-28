"use client";

import { useEffect, useState } from "react";

import { getPublishedCourses } from "@/features/courses/model/course-catalog";
import type { CourseDefinition } from "@/features/courses/model/course-types";
import { loadHomeCatalog } from "@/features/home/api/home-catalog-client";
import { preferOptimizedHomeImage } from "@/features/home/lib/optimized-home-image";

import { PromotionBanner } from "./promotion-banner";

function discountPercent(course: CourseDefinition): number {
    if (course.sale.originalPrice <= 0 || course.sale.salePrice >= course.sale.originalPrice) {
        return 0;
    }

    return Math.round(
        ((course.sale.originalPrice - course.sale.salePrice) / course.sale.originalPrice) * 100,
    );
}

export function CatalogPromotionBanner() {
    const [course, setCourse] = useState<CourseDefinition | null>(
        getPublishedCourses()[0] ?? null,
    );

    useEffect(() => {
        let cancelled = false;

        void loadHomeCatalog()
            .then((payload) => {
                if (!cancelled && Array.isArray(payload?.courses)) {
                    setCourse(payload.courses[0] ?? null);
                }
            })
            .catch(() => undefined);

        return () => { cancelled = true; };
    }, []);

    if (!course) return null;

    const discount = discountPercent(course);

    return (
        <PromotionBanner
            badge={discount > 0 ? `${discount}% CHEGIRMA` : "TA’LIMOT KURSI"}
            title={course.title}
            highlight={discount > 0 ? `${discount}% chegirma bilan` : course.accessDurationLabel}
            description={course.shortDescription}
            actionLabel="Kursni ko‘rish"
            href={`/kurslar/${course.slug}`}
            imageSrc={preferOptimizedHomeImage(course.coverImage)}
            imageAlt={course.coverImageAlt}
            note=""
        />
    );
}
