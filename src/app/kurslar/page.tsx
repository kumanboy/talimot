import {
    CoursesPage,
} from "@/features/courses/components/courses-page";

import {
    getPublishedCourses,
} from "@/features/courses/model/course-catalog";

export default function CoursesRoute() {
    return (
        <CoursesPage
            courses={getPublishedCourses()}
        />
    );
}
