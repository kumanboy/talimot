import type { AdminPaymentRecord } from "../server/get-admin-payments";

import styles from "./admin-payment-details-page.module.css";

function formatNumber(value: number): string {
    return new Intl.NumberFormat("uz-UZ").format(value);
}

function formatDate(value: number | null): string {
    if (!value) return "—";
    return new Intl.DateTimeFormat("uz-UZ", {
        timeZone: "Asia/Tashkent",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function kindLabel(kind: string): string {
    if (kind === "tanga") return "Tanga paketi";
    if (kind === "book") return "Kitob";
    if (kind === "course") return "Kurs";
    return kind;
}

function statusLabel(status: string): string {
    if (status === "pending") return "Kutilmoqda";
    if (status === "confirmed") return "Tasdiqlandi";
    if (status === "rejected") return "Rad etildi";
    if (status === "cancelled") return "Bekor qilindi";
    return status;
}

function metadataLabel(key: string): string {
    const labels: Record<string, string> = {
        tangaAmount: "Tanga miqdori",
        packageName: "Paket",
        unitPrice: "Kitob narxi",
        deliveryPrice: "Yetkazib berish",
        deliveryMethod: "Yetkazib berish usuli",
        region: "Viloyat",
        district: "Shahar / tuman",
        btsPoint: "BTS punkti",
        note: "Xaridor izohi",
    };
    return labels[key] ?? key;
}

function metadataRows(metadata: Record<string, unknown>) {
    return Object.entries(metadata).filter(([, value]) =>
        typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    );
}

export function AdminPaymentDetailsPage({
    payment,
    statusMessage,
}: {
    readonly payment: AdminPaymentRecord;
    readonly statusMessage?: string;
}) {
    const rows = metadataRows(payment.metadata);

    return (
        <>
            <header className={styles.header}>
                <div>
                    <a href="/admin/payments">← To‘lovlarga qaytish</a>
                    <span>TO‘LOV {payment.paymentCode}</span>
                    <h1>{payment.title}</h1>
                    <p>{kindLabel(payment.kind)} · {formatNumber(payment.amountSom)} so‘m</p>
                </div>
                <span className={`${styles.statusBadge} ${styles[payment.status]}`}>
                    {statusLabel(payment.status)}
                </span>
            </header>

            {statusMessage ? (
                <div className={statusMessage === "confirmed" ? styles.success : styles.message} role="status">
                    {statusMessage === "confirmed"
                        ? "To‘lov tasdiqlandi. Tanga to‘lovi bo‘lsa balans avtomatik yangilandi."
                        : statusMessage === "rejected"
                            ? "To‘lov rad etildi."
                            : statusMessage === "already_processed"
                                ? "Bu to‘lov avval qayta ishlangan."
                                : "Amalni bajarib bo‘lmadi."}
                </div>
            ) : null}

            <section className={styles.infoGrid}>
                <article><span>To‘lov ID</span><strong>{payment.paymentCode}</strong><small>{payment.id}</small></article>
                <article><span>Foydalanuvchi</span><strong>{payment.fullName ?? "—"}</strong><small>{payment.userNumber ? `ID ${payment.userNumber}` : "Platforma ID bog‘lanmagan"}</small></article>
                <article><span>Telefon</span><strong>{payment.phone ?? "—"}</strong><small>{payment.telegramUsername ? `@${payment.telegramUsername.replace(/^@/, "")}` : "Telegram username yo‘q"}</small></article>
                <article><span>Summa</span><strong>{formatNumber(payment.amountSom)} so‘m</strong><small>{payment.paymentMethod}</small></article>
            </section>

            <section className={styles.card}>
                <div className={styles.heading}>
                    <span>BUYURTMA MA’LUMOTI</span>
                    <h2>{payment.title}</h2>
                </div>
                <div className={styles.detailsGrid}>
                    <div><span>Turi</span><strong>{kindLabel(payment.kind)}</strong></div>
                    <div><span>Miqdor</span><strong>{payment.quantity} ta</strong></div>
                    <div><span>Yaratildi</span><strong>{formatDate(payment.createdAt)}</strong></div>
                    <div><span>Qayta ishlangan</span><strong>{formatDate(payment.processedAt)}</strong></div>
                    {rows.map(([key, value]) => (
                        <div key={key}><span>{metadataLabel(key)}</span><strong>{String(value)}</strong></div>
                    ))}
                </div>
            </section>

            {payment.status === "pending" ? (
                <section className={styles.card}>
                    <div className={styles.heading}>
                        <span>ADMIN TASDIQLASHI</span>
                        <h2>Chekni tekshirib, qaror qiling</h2>
                        <p>
                            Tanga to‘lovi tasdiqlansa paketdagi Tanga avtomatik hamyonga qo‘shiladi.
                            Kitob va kurs to‘lovlari esa tasdiqlangan buyurtma sifatida saqlanadi.
                        </p>
                    </div>
                    <form
                        className={styles.form}
                        action={`/api/admin/payments/${encodeURIComponent(payment.id)}/status`}
                        method="post"
                    >
                        <label>
                            <span>Chek / reference</span>
                            <input name="receiptReference" maxLength={100} placeholder="Chek ID, tranzaksiya raqami..." />
                        </label>
                        <label className={styles.noteField}>
                            <span>Admin izohi</span>
                            <input name="adminNote" maxLength={240} placeholder="Masalan: chek tekshirildi, summa mos..." />
                        </label>
                        <div className={styles.actions}>
                            <button name="action" value="confirm" className={styles.confirmButton} type="submit">To‘lovni tasdiqlash</button>
                            <button name="action" value="reject" className={styles.rejectButton} type="submit">Rad etish</button>
                        </div>
                    </form>
                </section>
            ) : (
                <section className={styles.card}>
                    <div className={styles.heading}>
                        <span>YAKUNIY HOLAT</span>
                        <h2>{statusLabel(payment.status)}</h2>
                    </div>
                    <div className={styles.detailsGrid}>
                        <div><span>Chek / reference</span><strong>{payment.receiptReference ?? "—"}</strong></div>
                        <div><span>Admin izohi</span><strong>{payment.adminNote ?? "—"}</strong></div>
                        <div><span>Qayta ishlagan</span><strong>{payment.processedBy ?? "—"}</strong></div>
                    </div>
                </section>
            )}
        </>
    );
}
