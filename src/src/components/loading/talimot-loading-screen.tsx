import Image from "next/image";

import styles from "./talimot-loading-screen.module.css";

export function TalimotLoadingScreen({ compact = false }: { readonly compact?: boolean }) {
    return (
        <div className={compact ? styles.compact : styles.screen} role="status" aria-live="polite" aria-label="TA’LIMOT yuklanmoqda">
            <div className={styles.loader}>
                <span className={styles.glow} aria-hidden="true" />
                <Image
                    className={styles.mark}
                    src="/brand/talimot-mark.svg"
                    alt=""
                    width={78}
                    height={78}
                    priority
                    aria-hidden="true"
                />
                <strong>TA’LIMOT</strong>
                <div className={styles.dots} aria-hidden="true"><span/><span/><span/></div>
                <small>Ma’lumotlar yuklanmoqda</small>
            </div>
        </div>
    );
}
