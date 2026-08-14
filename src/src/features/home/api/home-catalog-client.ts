import type { BookDefinition } from "@/features/books/model/book-types";
import type { CourseDefinition } from "@/features/courses/model/course-types";

type HomeCatalogPayload = {
    books?: BookDefinition[];
    courses?: CourseDefinition[];
};

let pendingRequest: Promise<HomeCatalogPayload | null> | null = null;

export function loadHomeCatalog(): Promise<HomeCatalogPayload | null> {
    if (!pendingRequest) {
        pendingRequest = fetch("/api/catalog/home", { cache: "no-store" })
            .then(async (response) => {
                if (!response.ok) {
                    return null;
                }

                return response.json() as Promise<HomeCatalogPayload>;
            })
            .catch(() => null);
    }

    return pendingRequest;
}
