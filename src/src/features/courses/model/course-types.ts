export type CourseStatus = "draft" | "published" | "archived";

export type CourseLessonType =
    | "live"
    | "video"
    | "audio"
    | "material";

export type CourseAccent =
    | "primary"
    | "violet"
    | "orange"
    | "teal";

export interface CourseLesson {
    readonly id: string;
    readonly title: string;
    readonly type: CourseLessonType;
    readonly durationLabel?: string;
}

export interface CourseModule {
    readonly id: string;
    readonly title: string;
    readonly description?: string;
    readonly lessons: readonly CourseLesson[];
}

export interface CourseInstructor {
    readonly name: string;
    readonly role: string;
    readonly biography: string;
    readonly image?: string;
}

export interface CourseSale {
    readonly originalPrice: number;
    readonly salePrice: number;
    readonly startsAt?: string;
    readonly endsAt: string;
}

export interface CourseDefinition {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly shortDescription: string;
    readonly fullDescription: readonly string[];
    readonly badge: string;
    readonly coverImage: string;
    readonly coverImageAlt: string;
    readonly accent: CourseAccent;
    readonly instructor: CourseInstructor;
    readonly format: string;
    readonly schedule: string;
    readonly accessDescription: string;
    readonly accessDurationLabel: string;
    readonly benefits: readonly string[];
    readonly modules: readonly CourseModule[];
    readonly sale: CourseSale;
    readonly status: CourseStatus;
}
