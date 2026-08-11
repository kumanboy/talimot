import type {
    AdminTangaOverview,
} from "../server/get-admin-tanga";

import styles from "./admin-tanga-page.module.css";

function formatDate(value: number | null): string {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("uz-UZ", {
        timeZone: "Asia/Tashkent",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat("uz-UZ").format(value);
}

function sourceLabel(value: string): string {
    switch (value) {
        case "humo_payment":
        case "uzcard_payment":
            return "UZCARD to‘lov";
        case "promo_bonus":
            return "Promo bonus";
        case "manual_correction":
            return "Qo‘lda tuzatish";
        case "other":
            return "Boshqa";
        case "admin_adjustment":
            return "Admin amali";
        default:
            return value;
    }
}

export function AdminTangaPage({
    overview,
    search,
}: {
    readonly overview: AdminTangaOverview;
    readonly search: string;
}) {
    return (
        <>
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>TA’LIMOT ADMIN</span>
                    <h1>Tanga</h1>
                    <p>
                        Foydalanuvchi hamyonlari, Tanga kirim-chiqimlari va
                        tranzaksiyalar tarixini boshqaring.
                    </p>
                </div>

                <a className={styles.openPlatform} href="/packages" target="_blank">
                    Student Tanga sahifasini ochish
                </a>
            </header>

            <section className={styles.statsGrid}>
                <article>
                    <span>Jami hamyon</span>
                    <strong>{formatNumber(overview.walletCount)}</strong>
                </article>
                <article>
                    <span>Muomaladagi Tanga</span>
                    <strong>{formatNumber(overview.totalBalance)}</strong>
                </article>
                <article>
                    <span>Jami qo‘shilgan</span>
                    <strong>{formatNumber(overview.lifetimeCredited)}</strong>
                </article>
                <article>
                    <span>Jami sarflangan</span>
                    <strong>{formatNumber(overview.lifetimeSpent)}</strong>
                </article>
            </section>

            <section className={styles.catalogCard}>
                <div className={styles.sectionHeading}>
                    <div>
                        <span>HAMYONLAR</span>
                        <h2>Foydalanuvchilar balansi</h2>
                    </div>
                    <p>{overview.records.length} ta foydalanuvchi</p>
                </div>

                <form className={styles.filters} method="get">
                    <label>
                        <span>Foydalanuvchini qidirish</span>
                        <input
                            type="search"
                            name="q"
                            defaultValue={search}
                            placeholder="Foydalanuvchi ID (masalan 5700), telefon, ism yoki Telegram..."
                        />
                    </label>
                    <button type="submit">Qidirish</button>
                    {search ? (
                        <a href="/admin/tanga">Tozalash</a>
                    ) : null}
                </form>

                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>Foydalanuvchi</th>
                                <th>Telefon</th>
                                <th>Holat</th>
                                <th>Balans</th>
                                <th>Jami qo‘shilgan</th>
                                <th>Jami sarflangan</th>
                                <th>Yangilangan</th>
                                <th>Amal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overview.records.length === 0 ? (
                                <tr>
                                    <td className={styles.emptyState} colSpan={8}>
                                        Foydalanuvchi topilmadi.
                                    </td>
                                </tr>
                            ) : (
                                overview.records.map((record) => (
                                    <tr key={record.id}>
                                        <td>
                                            <div className={styles.userIdentity}>
                                                <div className={styles.avatar} aria-hidden="true">
                                                    {record.firstName.slice(0, 1).toUpperCase()}
                                                    {record.lastName.slice(0, 1).toUpperCase()}
                                                </div>
                                                <div>
                                                    <strong>
                                                        {record.firstName} {record.lastName}
                                                    </strong>
                                                    <span>
                                                        ID {record.userNumber}
                                                        {record.telegramUsername
                                                            ? ` · @${record.telegramUsername.replace(/^@/, "")}`
                                                            : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{record.phone}</td>
                                        <td>
                                            <span
                                                className={
                                                    record.status === "active"
                                                        ? styles.activeBadge
                                                        : styles.blockedBadge
                                                }
                                            >
                                                {record.status === "active" ? "Faol" : "Bloklangan"}
                                            </span>
                                        </td>
                                        <td>
                                            <strong className={styles.balanceValue}>
                                                {formatNumber(record.balance)} Tanga
                                            </strong>
                                        </td>
                                        <td>+{formatNumber(record.lifetimeCredited)}</td>
                                        <td>-{formatNumber(record.lifetimeSpent)}</td>
                                        <td>{formatDate(record.walletUpdatedAt)}</td>
                                        <td>
                                            <a
                                                className={styles.manageLink}
                                                href={`/admin/tanga/${encodeURIComponent(record.id)}`}
                                            >
                                                Boshqarish
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className={styles.catalogCard}>
                <div className={styles.sectionHeading}>
                    <div>
                        <span>LEDGER</span>
                        <h2>So‘nggi tranzaksiyalar</h2>
                    </div>
                    <p>Oxirgi 50 ta yozuv</p>
                </div>

                <div className={styles.tableWrap}>
                    <table className={styles.transactionTable}>
                        <thead>
                            <tr>
                                <th>Vaqt</th>
                                <th>Foydalanuvchi</th>
                                <th>Yo‘nalish</th>
                                <th>Miqdor</th>
                                <th>Balans</th>
                                <th>Manba</th>
                                <th>Izoh</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overview.recentTransactions.length === 0 ? (
                                <tr>
                                    <td className={styles.emptyState} colSpan={7}>
                                        Hali Tanga tranzaksiyasi mavjud emas.
                                    </td>
                                </tr>
                            ) : (
                                overview.recentTransactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>{formatDate(transaction.createdAt)}</td>
                                        <td>
                                            <a
                                                className={styles.userLink}
                                                href={`/admin/tanga/${encodeURIComponent(transaction.userId)}`}
                                            >
                                                {transaction.firstName} {transaction.lastName}
                                                <small> · ID {transaction.userNumber}</small>
                                            </a>
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    transaction.direction === "credit"
                                                        ? styles.creditBadge
                                                        : styles.debitBadge
                                                }
                                            >
                                                {transaction.direction === "credit"
                                                    ? "Kirim"
                                                    : "Chiqim"}
                                            </span>
                                        </td>
                                        <td>
                                            <strong
                                                className={
                                                    transaction.direction === "credit"
                                                        ? styles.creditAmount
                                                        : styles.debitAmount
                                                }
                                            >
                                                {transaction.direction === "credit" ? "+" : "-"}
                                                {formatNumber(transaction.amount)}
                                            </strong>
                                        </td>
                                        <td>
                                            {formatNumber(transaction.balanceBefore)} → {formatNumber(transaction.balanceAfter)}
                                        </td>
                                        <td>{sourceLabel(transaction.source)}</td>
                                        <td>{transaction.note ?? "—"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}
