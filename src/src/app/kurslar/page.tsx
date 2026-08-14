import { connection } from "next/server";

import { CoursesPage } from "@/features/courses/components/courses-page";
import { getPublishedCoursesFromDatabase } from "@/features/catalog/server/catalog-repository";

export const dynamic = "force-dynamic";

export default async function CoursesRoute() {
    await connection();
    const courses = await getPublishedCoursesFromDatabase();
    return <CoursesPage courses={courses} />;
}
