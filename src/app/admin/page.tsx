import {
    redirect,
} from "next/navigation";

import {
    AdminShell,
} from "@/features/admin/components/admin-shell";
import {
    hasValidAdminSession,
} from "@/features/admin/model/admin-session";

import styles from "./admin.module.css";

const dashboardSections = [
    {
        title: "Testlar",
        description:
            "Test katalogi va diagnostika imtihonlari.",
        status: "Keyingi bosqich",
        href: "/admin/tests",
        enabled: true,
    },
    {
        title: "Natijalar",
        description:
            "Diagnostika urinishlari va ballar.",
        status: "Backend kerak",
        enabled: false,
    },
    {
        title: "Foydalanuvchilar",
        description:
            "Profil, Telegram tasdiqlashi va akkaunt holati.",
        status: "Ishlayapti",
        href: "/admin/users",
        enabled: true,
    },
    {
        title: "Sertifikatlar",
        description:
            "Berilgan diagnostika sertifikatlari.",
        status: "Backend kerak",
        enabled: false,
    },
    {
        title: "Kurslar va kitoblar",
        description:
            "Mahsulotlar katalogini boshqarish.",
        status: "Keyingi bosqich",
        enabled: false,
    },
    {
        title: "Tanga va to‘lovlar",
        description:
            "Tanga hamyonlari va HUMO to‘lov so‘rovlarini boshqarish.",
        status: "Ishlayapti",
        href: "/admin/payments",
        enabled: true,
    },
] as const;

export default async function AdminPage() {
    const authenticated =
        await hasValidAdminSession();

    if (!authenticated) {
        redirect("/admin/login");
    }

    return (
        <AdminShell activeItem="dashboard">
            <header className={styles.dashboardHeader}>
                <div>
                    <span>
                        TA’LIMOT ADMIN
                    </span>

                    <h1>
                        Boshqaruv paneli
                    </h1>

                    <p>
                        Platforma boshqaruvi uchun
                        xavfsiz desktop workspace.
                    </p>
                </div>

                <div className={styles.sessionBadge}>
                    <span />

                    Admin sessiya faol
                </div>
            </header>

            <section className={styles.welcomeCard}>
                <div>
                    <span>
                        FOUNDATION READY
                    </span>

                    <h2>
                        Admin kirish tizimi ishlashga tayyor
                    </h2>

                    <p>
                        Endi boshqaruv bo‘limlarini
                        bitta umumiy admin shell orqali
                        bosqichma-bosqich ulaymiz.
                    </p>
                </div>

                <strong>
                    Desktop only
                </strong>
            </section>

            <div className={styles.sectionGrid}>
                {dashboardSections.map(
                    (section) => {
                        const content = (
                            <>
                                <span>
                                    {section.status}
                                </span>

                                <h2>
                                    {section.title}
                                </h2>

                                <p>
                                    {
                                        section.description
                                    }
                                </p>
                            </>
                        );

                        if (
                            section.enabled &&
                            "href" in section
                        ) {
                            return (
                                <a
                                    key={section.title}
                                    href={section.href}
                                >
                                    {content}
                                </a>
                            );
                        }

                        return (
                            <article
                                key={section.title}
                            >
                                {content}
                            </article>
                        );
                    },
                )}
            </div>
        </AdminShell>
    );
}
