import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ResultsPage } from "@/features/results/components/results-page";
import { getMyTestsLibrary } from "@/features/my-tests/server/get-my-tests-library";

export const metadata: Metadata = {
    title: "Natijalar | TA’LIMOT",
    description:
        "Sotib olingan testlar, urinishlar tarixi, birinchi, oxirgi va eng yaxshi natijalaringizni bir joyda ko‘ring.",
};

export const dynamic = "force-dynamic";

export default async function ResultsRoutePage() {
    const data = await getMyTestsLibrary();

    if (!data.authenticated) {
        redirect("/auth/login?next=%2Fnatijalar");
    }

    return <ResultsPage data={data} />;
}
