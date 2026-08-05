import {
    TalimotLogo,
} from "@/components/brand/talimot-logo";

import styles from "./loading.module.css";

export default function Loading() {
    return (
        <main
            className={styles.page}
            aria-busy="true"
            aria-live="polite"
        >
            <div className={styles.glow} aria-hidden="true" />

            <section className={styles.card}>
                <div className={styles.logo}>
                    <TalimotLogo />
                </div>

                <div
                    className={styles.loader}
                    aria-hidden="true"
                >
                    <span />
                    <span />
                    <span />
                </div>

                <div className={styles.copy}>
                    <strong>Sahifa yuklanmoqda</strong>
                    <p>
                        Kerakli ma’lumotlar tayyorlanmoqda…
                    </p>
                </div>
            </section>
        </main>
    );
}
