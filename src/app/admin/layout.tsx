import type {
    Metadata,
} from "next";

import styles from "./admin.module.css";

export const metadata: Metadata = {
    title:
        "Admin panel | TA’LIMOT",
    robots: {
        index: false,
        follow: false,
    },
};

type AdminLayoutProps = Readonly<{
    children:
        React.ReactNode;
}>;

export default function AdminLayout({
    children,
}: AdminLayoutProps) {
    return (
        <div className={styles.adminRoot}>
            <section
                className={styles.mobileBlock}
            >
                <div
                    className={
                        styles.mobileBlockIcon
                    }
                    aria-hidden="true"
                >
                    ↗
                </div>

                <span>
                    ADMIN PANEL
                </span>

                <h1>
                    Kompyuterda oching
                </h1>

                <p>
                    Xavfsizlik va boshqaruv
                    qulayligi uchun admin panel
                    faqat 1024 px va undan katta
                    laptop yoki desktop ekranlarda
                    ishlaydi.
                </p>
            </section>

            <div
                className={styles.desktopOnly}
            >
                {children}
            </div>
        </div>
    );
}
