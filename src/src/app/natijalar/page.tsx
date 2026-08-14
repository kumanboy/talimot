import type {
    Metadata,
} from "next";

import { ResultsPage } from "@/features/results/components/results-page";

export const metadata: Metadata = {
    title: "Natijalar | TA’LIMOT",
    description:
        "Yakunlangan testlar, o‘rtacha natija va testlar tarixini ko‘ring.",
};

export default function ResultsRoutePage() {
    return <ResultsPage />;
}