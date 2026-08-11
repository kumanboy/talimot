import styles from "./admin-tanga-user-page.module.css";

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

type TangaUserDetails = {
    readonly user: {
        readonly id: string;
        readonly firstName: string;
        readonly lastName: string;
        readonly fatherName: string;
        readonly phone: string;
        readonly status: string;
        readonly telegramUsername: string | null;
        readonly balance: number;
        readonly lifetimeCredited: number;
        readonly lifetimeSpent: number;
        readonly walletUpdatedAt: number | null;
    };
    readonly transactions: readonly {
        readonly id: string;
        readonly userId: string;
        readonly direction: "credit" | "debit";
        readonly amount: number;
        readonly balanceBefore: number;
        readonly balanceAfter: number;
        readonly source: string;
        readonly note: string | null;
        readonly createdBy: string | null;
        readonly createdAt: number;
    }[];
};

export function AdminTangaUserPage({
    details,
    statusMessage,
}: {
    readonly details: TangaUserDetails;
    readonly statusMessage?: "credited" | "debited" | "insufficient" | "invalid" | "failed";
}) {
    const { user, transactions } = details;

    return (
        <>
            <header className={styles.header}>
                <div>
                    <a href="/admin/tanga">← Tanga bo‘limiga qaytish</a>
                    <h1>{user.firstName} {user.lastName}</h1>
                    <p>{user.phone} · {user.fatherName}</p>
                </div>

                <span
                    className={
                        user.status === "active"
                            ? styles.activeBadge
                            : styles.blockedBadge
                    }
                >
                    {user.status === "active" ? "Faol" : "Bloklangan"}
                </span>
            </header>

            {statusMessage ? (
                <div
                    className={
                        statusMessage === "credited" || statusMessage === "debited"
                            ? styles.successMessage
                            : styles.errorMessage
                    }
                    role="status"
                >
                    {statusMessage === "credited"
                        ? "Tanga muvaffaqiyatli qo‘shildi."
                        : statusMessage === "debited"
                            ? "Tanga muvaffaqiyatli ayirildi."
                            : statusMessage === "insufficient"
                                ? "Foydalanuvchi balansida yetarli Tanga yo‘q."
                                : statusMessage === "invalid"
                                    ? "Miqdor noto‘g‘ri. 1 dan 1 000 000 gacha Tanga kiriting."
                                    : "Tranzaksiyani bajarib bo‘lmadi."}
                </div>
            ) : null}

            <section className={styles.walletGrid}>
                <article className={styles.balanceCard}>
                    <span>JORIY BALANS</span>
                    <strong>{formatNumber(user.balance)}</strong>
                    <p>Tanga</p>
                    <small>Yangilangan: {formatDate(user.walletUpdatedAt)}</small>
                </article>

                <article>
                    <span>Jami qo‘shilgan</span>
                    <strong>+{formatNumber(user.lifetimeCredited)}</strong>
                </article>

                <article>
                    <span>Jami sarflangan</span>
                    <strong>-{formatNumber(user.lifetimeSpent)}</strong>
                </article>
            </section>

            <section className={styles.adjustCard}>
                <div className={styles.sectionHeading}>
                    <span>ADMIN AMALI</span>
                    <h2>Tanga balansini o‘zgartirish</h2>
                    <p>
                        Har bir amal ledger’da alohida tranzaksiya sifatida saqlanadi.
                    </p>
                </div>

                <form
                    className={styles.adjustForm}
                    action={`/api/admin/tanga/${encodeURIComponent(user.id)}/adjust`}
                    method="post"
                >
                    <label>
                        <span>Amal turi</span>
                        <select name="direction" defaultValue="credit" required>
                            <option value="credit">Tanga qo‘shish</option>
                            <option value="debit">Tanga ayirish</option>
                        </select>
                    </label>

                    <label>
                        <span>Miqdor</span>
                        <input
                            type="number"
                            name="amount"
                            min="1"
                            max="1000000"
                            step="1"
                            placeholder="Masalan: 100"
                            required
                        />
                    </label>

                    <label className={styles.noteField}>
                        <span>Izoh</span>
                        <input
                            type="text"
                            name="note"
                            maxLength={160}
                            placeholder="Masalan: Promo bonus, qo‘lda to‘lov, tuzatish..."
                        />
                    </label>

                    <button type="submit">Tranzaksiyani bajarish</button>
                </form>
            </section>

            <section className={styles.historyCard}>
                <div className={styles.sectionHeading}>
                    <span>TRANZAKSIYA TARIXI</span>
                    <h2>{transactions.length} ta so‘nggi amal</h2>
                </div>

                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>Vaqt</th>
                                <th>Yo‘nalish</th>
                                <th>Miqdor</th>
                                <th>Oldingi balans</th>
                                <th>Yangi balans</th>
                                <th>Manba</th>
                                <th>Izoh</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td className={styles.emptyState} colSpan={7}>
                                        Bu foydalanuvchida hali Tanga tranzaksiyasi yo‘q.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>{formatDate(transaction.createdAt)}</td>
                                        <td>
                                            <span
                                                className={
                                                    transaction.direction === "credit"
                                                        ? styles.creditBadge
                                                        : styles.debitBadge
                                                }
                                            >
                                                {transaction.direction === "credit" ? "Kirim" : "Chiqim"}
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
                                        <td>{formatNumber(transaction.balanceBefore)}</td>
                                        <td>{formatNumber(transaction.balanceAfter)}</td>
                                        <td>{transaction.source}</td>
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
