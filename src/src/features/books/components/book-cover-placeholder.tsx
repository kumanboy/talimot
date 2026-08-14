import styles from "./book-cover-placeholder.module.css";

type BookCoverPlaceholderProps = {
    readonly title: string;
    readonly badge: string;
    readonly compact?: boolean;
};

export function BookCoverPlaceholder({
    title,
    badge,
    compact = false,
}: BookCoverPlaceholderProps) {
    return (
        <div
            className={`${styles.cover} ${
                compact ? styles.compact : ""
            }`}
            role="img"
            aria-label={`${title} kitobi muqovasi`}
        >
            <span className={styles.badge}>{badge}</span>
            <span className={styles.brand}>TA’LIMOT</span>
            <strong>{title}</strong>
            <span className={styles.subtitle}>MILLIY SERTIFIKAT UCHUN</span>
            <div className={styles.mark} aria-hidden="true">T</div>
        </div>
    );
}
