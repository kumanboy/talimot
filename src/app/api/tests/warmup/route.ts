import {
    getActiveStudentUserId,
} from "@/features/auth/server/get-active-student-user";
import {
    warmStudentTestCatalogCache,
} from "@/features/tests/server/get-cached-published-test-drafts";

export const dynamic = "force-dynamic";

/**
 * Low-priority browser warmup. It primes public test-list metadata and the
 * lightweight active-user status lookup. No wallet, purchase, result or full
 * question payload is fetched here.
 */
export async function GET() {
    try {
        await Promise.all([
            warmStudentTestCatalogCache(),
            getActiveStudentUserId(),
        ]);

        return new Response(null, {
            status: 204,
            headers: {
                "Cache-Control":
                    "private, no-store, max-age=0",
            },
        });
    } catch (error) {
        console.error(
            "Student test catalogue warmup failed.",
            error,
        );

        // Warmup is an enhancement only. Do not expose internal details.
        return new Response(null, {
            status: 204,
            headers: {
                "Cache-Control":
                    "private, no-store, max-age=0",
            },
        });
    }
}
