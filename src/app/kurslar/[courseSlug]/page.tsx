import { notFound } from "next/navigation";
import { connection } from "next/server";

import { CourseDetailPage } from "@/features/courses/components/course-detail-page";
import { getCourseBySlugFromDatabase } from "@/features/catalog/server/catalog-repository";

export const dynamic = "force-dynamic";

type CourseRouteProps = { readonly params: Promise<{ courseSlug: string }> };

export default async function CourseRoute({ params }: CourseRouteProps) {
    await connection();
    const { courseSlug } = await params;
    const course = await getCourseBySlugFromDatabase(courseSlug);
    if (!course) notFound();
    return <CourseDetailPage course={course} />;
}
