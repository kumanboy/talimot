import {
    notFound,
} from "next/navigation";

import {
    CoursePurchasePage,
} from "@/features/courses/components/course-purchase-page";

import {
    getCourseBySlug,
    getPublishedCourses,
} from "@/features/courses/model/course-catalog";

type CoursePurchaseRouteProps = {
    readonly params: Promise<{
        courseSlug: string;
    }>;
};

export function generateStaticParams() {
    return getPublishedCourses().map(
        (course) => ({
            courseSlug: course.slug,
        }),
    );
}

export default async function CoursePurchaseRoute({
    params,
}: CoursePurchaseRouteProps) {
    const {
        courseSlug,
    } = await params;

    const course =
        getCourseBySlug(
            courseSlug,
        );

    if (!course) {
        notFound();
    }

    return (
        <CoursePurchasePage
            course={course}
        />
    );
}
