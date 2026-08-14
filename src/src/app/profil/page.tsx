import type { Metadata } from "next";

import {
    ProfilePage,
} from "@/features/profile/components/profile-page";

export const metadata: Metadata = {
    title: "Profil | TA’LIMOT",
    description:
        "TA’LIMOT foydalanuvchi profili va hisob sozlamalari.",
};

export default function ProfileRoute() {
    return <ProfilePage />;
}
