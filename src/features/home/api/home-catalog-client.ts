import type { BookDefinition } from "@/features/books/model/book-types";
import type { CourseDefinition } from "@/features/courses/model/course-types";

type HomeCatalogPayload = {
    books?: BookDefinition[];
    courses?: CourseDefinition[];
};

let pendingRequest: Promise<HomeCatalogPayload | null> | null = null;

function startCatalogRequest(): Promise<HomeCatalogPayload | null> {
    return fetch("/api/catalog/home")
        .then(async (response) => {
            if (!response.ok) {
                return null;
            }

            return response.json() as Promise<HomeCatalogPayload>;
        })
        .catch(() => null);
}

/**
 * The home screen already has code-based catalog fallbacks, so the DB override
 * request can wait until the browser is idle. This keeps the first paint and
 * the first user interaction free from an avoidable network/JSON task.
 */
export function loadHomeCatalog(): Promise<HomeCatalogPayload | null> {
    if (!pendingRequest) {
        pendingRequest = new Promise((resolve) => {
            const run = () => {
                void startCatalogRequest().then(resolve);
            };

            if (typeof window === "undefined") {
                run();
                return;
            }

            if ("requestIdleCallback" in window) {
                window.requestIdleCallback(run, { timeout: 1000 });
                return;
            }

            window.setTimeout(run, 350);
        });
    }

    return pendingRequest;
}
