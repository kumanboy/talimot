import type { Metadata } from "next";

import {
    TangaPackagesPage,
} from "@/features/tanga/components/tanga-packages-page";

export const metadata: Metadata = {
    title: "Tanga paketlari | TA’LIMOT",
    description:
        "TA’LIMOT xizmatlari uchun Tanga paketlarini tanlash sahifasi.",
};

export default function PackagesPage() {
    return <TangaPackagesPage />;
}
