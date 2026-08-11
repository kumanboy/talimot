import { notFound } from "next/navigation";
import { connection } from "next/server";

import { CoursePurchasePage } from "@/features/courses/components/course-purchase-page";
import { getCourseBySlugFromDatabase } from "@/features/catalog/server/catalog-repository";

export const dynamic = "force-dynamic";

type CoursePurchaseRouteProps = { readonly params: Promise<{ courseSlug: string }> };

export default async function CoursePurchaseRoute({ params }: CoursePurchaseRouteProps) {
    await connection();
    const { courseSlug } = await params;
    const course = await getCourseBySlugFromDatabase(courseSlug);
    if (!course) notFound();
    return <CoursePurchasePage course={course} />;
}
