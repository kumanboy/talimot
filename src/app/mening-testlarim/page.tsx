import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MyTestsPage } from "@/features/my-tests/components/my-tests-page";
import { getMyTestsLibrary } from "@/features/my-tests/server/get-my-tests-library";

export const metadata: Metadata = {
    title: "Mening testlarim | TA’LIMOT",
    description:
        "Sotib olingan testlar, urinishlar tarixi va eng yaxshi natijalaringizni ko‘ring.",
};

export const dynamic = "force-dynamic";

export default async function MyTestsRoute() {
    const data = await getMyTestsLibrary();

    if (!data.authenticated) {
        redirect("/auth/login?next=%2Fmening-testlarim");
    }

    return <MyTestsPage data={data} />;
}
