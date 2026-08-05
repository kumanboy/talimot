import {
    notFound,
} from "next/navigation";

import {
    CourseDetailPage,
} from "@/features/courses/components/course-detail-page";

import {
    courses,
    getCourseBySlug,
} from "@/features/courses/model/course-catalog";

type CourseRouteProps = {
    readonly params: Promise<{
        courseSlug: string;
    }>;
};

export function generateStaticParams() {
    return courses
        .filter((course) => course.status === "published")
        .map((course) => ({
            courseSlug: course.slug,
        }));
}

export default async function CourseRoute({
    params,
}: CourseRouteProps) {
    const { courseSlug } = await params;
    const course = getCourseBySlug(courseSlug);

    if (!course) {
        notFound();
    }

    return <CourseDetailPage course={course} />;
}
