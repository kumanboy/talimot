import styles from "./admin-user-details-page.module.css";

type AdminUserDetails = {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly fatherName: string;
    readonly phone: string;
    readonly role: string;
    readonly status: string;
    readonly telegramUserId: number | null;
    readonly telegramChatId: number | null;
    readonly telegramUsername: string | null;
    readonly phoneVerifiedAt: number | null;
    readonly createdAt: number;
    readonly updatedAt: number;
};

function formatDate(value: number | null): string {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("uz-UZ", {
        timeZone: "Asia/Tashkent",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export function AdminUserDetailsPage({ user }: { user: AdminUserDetails }) {
    const fullName = `${user.lastName} ${user.firstName} ${user.fatherName}`;

    return (
        <>
            <header className={styles.header}>
                <div>
                    <a href="/admin/users">← Foydalanuvchilarga qaytish</a>
                    <h1>{user.firstName} {user.lastName}</h1>
                    <p>Akkaunt va Telegram identifikatsiya ma’lumotlari.</p>
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

            <section className={styles.profileCard}>
                <div className={styles.profileHeading}>
                    <div className={styles.avatar} aria-hidden="true">
                        {user.firstName.slice(0, 1).toUpperCase()}
                        {user.lastName.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                        <span>FOYDALANUVCHI PROFILI</span>
                        <h2>{fullName}</h2>
                        <p>{user.phone}</p>
                    </div>
                </div>

                <form
                    action={`/api/admin/users/${encodeURIComponent(user.id)}/status`}
                    method="post"
                >
                    <input
                        type="hidden"
                        name="status"
                        value={user.status === "active" ? "blocked" : "active"}
                    />
                    <input
                        type="hidden"
                        name="returnTo"
                        value={`/admin/users/${user.id}`}
                    />
                    <button
                        className={
                            user.status === "active"
                                ? styles.blockButton
                                : styles.activateButton
                        }
                        type="submit"
                    >
                        {user.status === "active"
                            ? "Foydalanuvchini bloklash"
                            : "Akkauntni faollashtirish"}
                    </button>
                </form>
            </section>

            <section className={styles.detailsGrid}>
                <article>
                    <span>Shaxsiy ma’lumotlar</span>
                    <dl>
                        <div><dt>Ism</dt><dd>{user.firstName}</dd></div>
                        <div><dt>Familiya</dt><dd>{user.lastName}</dd></div>
                        <div><dt>Otasining ismi</dt><dd>{user.fatherName}</dd></div>
                        <div><dt>Telefon</dt><dd>{user.phone}</dd></div>
                        <div><dt>Role</dt><dd>{user.role}</dd></div>
                    </dl>
                </article>

                <article>
                    <span>Telegram</span>
                    <dl>
                        <div>
                            <dt>Username</dt>
                            <dd>
                                {user.telegramUsername
                                    ? `@${user.telegramUsername.replace(/^@/, "")}`
                                    : "—"}
                            </dd>
                        </div>
                        <div><dt>Telegram user ID</dt><dd>{user.telegramUserId ?? "—"}</dd></div>
                        <div><dt>Telegram chat ID</dt><dd>{user.telegramChatId ?? "—"}</dd></div>
                        <div><dt>Telefon tasdiqlangan</dt><dd>{formatDate(user.phoneVerifiedAt)}</dd></div>
                    </dl>
                </article>

                <article>
                    <span>Akkaunt</span>
                    <dl>
                        <div><dt>User ID</dt><dd className={styles.mono}>{user.id}</dd></div>
                        <div><dt>Holat</dt><dd>{user.status}</dd></div>
                        <div><dt>Yaratilgan</dt><dd>{formatDate(user.createdAt)}</dd></div>
                        <div><dt>Yangilangan</dt><dd>{formatDate(user.updatedAt)}</dd></div>
                    </dl>
                </article>
            </section>
        </>
    );
}
