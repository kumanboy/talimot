import type { AdminPaymentsOverview } from "../server/get-admin-payments";

import styles from "./admin-payments-page.module.css";

function formatNumber(value: number): string {
    return new Intl.NumberFormat("uz-UZ").format(value);
}

function formatDate(value: number): string {
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
    if (kind === "tanga") return "Tanga";
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

export function AdminPaymentsPage({
    overview,
    search,
    status,
    kind,
}: {
    readonly overview: AdminPaymentsOverview;
    readonly search: string;
    readonly status: string;
    readonly kind: string;
}) {
    return (
        <>
            <header className={styles.header}>
                <div>
                    <span>TA’LIMOT ADMIN</span>
                    <h1>To‘lovlar</h1>
                    <p>
                        Tanga, kitob va kurs bo‘yicha UZCARD to‘lov so‘rovlarini
                        tekshiring, chek ma’lumotini saqlang va tasdiqlang.
                    </p>
                </div>
            </header>

            <section className={styles.statsGrid}>
                <article><span>Jami so‘rov</span><strong>{formatNumber(overview.totalCount)}</strong></article>
                <article><span>Kutilmoqda</span><strong>{formatNumber(overview.pendingCount)}</strong></article>
                <article><span>Tasdiqlandi</span><strong>{formatNumber(overview.confirmedCount)}</strong></article>
                <article><span>Tasdiqlangan tushum</span><strong>{formatNumber(overview.confirmedRevenueSom)} so‘m</strong></article>
            </section>

            <section className={styles.card}>
                <div className={styles.heading}>
                    <div>
                        <span>TO‘LOV SO‘ROVLARI</span>
                        <h2>So‘nggi to‘lovlar</h2>
                    </div>
                    <p>{overview.records.length} ta yozuv</p>
                </div>

                <form className={styles.filters} method="get">
                    <label>
                        <span>Qidiruv</span>
                        <input
                            name="q"
                            defaultValue={search}
                            placeholder="PAY-ID, user ID, telefon, ism..."
                        />
                    </label>
                    <label>
                        <span>Holat</span>
                        <select name="status" defaultValue={status}>
                            <option value="">Barchasi</option>
                            <option value="pending">Kutilmoqda</option>
                            <option value="confirmed">Tasdiqlandi</option>
                            <option value="rejected">Rad etildi</option>
                            <option value="cancelled">Bekor qilindi</option>
                        </select>
                    </label>
                    <label>
                        <span>Turi</span>
                        <select name="kind" defaultValue={kind}>
                            <option value="">Barchasi</option>
                            <option value="tanga">Tanga</option>
                            <option value="book">Kitob</option>
                            <option value="course">Kurs</option>
                        </select>
                    </label>
                    <button type="submit">Qidirish</button>
                    <a href="/admin/payments">Tozalash</a>
                </form>

                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>To‘lov ID</th>
                                <th>Vaqt</th>
                                <th>Foydalanuvchi</th>
                                <th>Turi</th>
                                <th>Mahsulot / paket</th>
                                <th>Summa</th>
                                <th>Holat</th>
                                <th>Amal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overview.records.length === 0 ? (
                                <tr><td className={styles.empty} colSpan={8}>To‘lov so‘rovi topilmadi.</td></tr>
                            ) : overview.records.map((payment) => (
                                <tr key={payment.id}>
                                    <td><strong className={styles.code}>{payment.paymentCode}</strong></td>
                                    <td>{formatDate(payment.createdAt)}</td>
                                    <td>
                                        <strong>{payment.fullName ?? "—"}</strong>
                                        <small>
                                            {payment.userNumber ? `ID ${payment.userNumber} · ` : ""}
                                            {payment.phone ?? "Telefon yo‘q"}
                                        </small>
                                    </td>
                                    <td><span className={styles.kindBadge}>{kindLabel(payment.kind)}</span></td>
                                    <td>
                                        <strong>{payment.title}</strong>
                                        {payment.quantity > 1 ? <small>{payment.quantity} ta</small> : null}
                                    </td>
                                    <td><strong>{formatNumber(payment.amountSom)} so‘m</strong></td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[payment.status]}`}>
                                            {statusLabel(payment.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <a className={styles.viewLink} href={`/admin/payments/${encodeURIComponent(payment.id)}`}>
                                            Ko‘rish
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}
