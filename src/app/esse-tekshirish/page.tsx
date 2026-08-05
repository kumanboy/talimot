import type { Metadata } from "next";

import { EssayCheckPage } from "@/features/essay-check/components/essay-check-page";

export const metadata: Metadata = {
    title: "Esse tekshirish | TA’LIMOT",
    description:
        "Esseni AI yoki ustoz bilan tekshirish xizmatini tanlash sahifasi.",
};

export default function EssayCheckRoute() {
    return <EssayCheckPage />;
}
