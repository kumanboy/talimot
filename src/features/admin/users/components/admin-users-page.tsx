import type {
    AdminUserRoleFilter,
    AdminUsersOverview,
    AdminUserStatusFilter,
} from "../server/get-admin-users";

import styles from "./admin-users-page.module.css";

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

function telegramLabel(
    username: string | null,
    userId: number | null,
): string {
    if (username) {
        return `@${username.replace(/^@/, "")}`;
    }

    if (userId) {
        return String(userId);
    }

    return "Ulanmagan";
}


function paginationHref(options: {
    page: number;
    search: string;
    status: AdminUserStatusFilter;
    role: AdminUserRoleFilter;
}): string {
    const params = new URLSearchParams();

    if (options.search) {
        params.set("q", options.search);
    }

    if (options.status !== "all") {
        params.set("status", options.status);
    }

    if (options.role !== "all") {
        params.set("role", options.role);
    }

    if (options.page > 1) {
        params.set("page", String(options.page));
    }

    const query = params.toString();
    return query ? `/admin/users?${query}` : "/admin/users";
}

interface AdminUsersPageProps {
    readonly overview: AdminUsersOverview;
    readonly search: string;
    readonly status: AdminUserStatusFilter;
    readonly role: AdminUserRoleFilter;
}

export function AdminUsersPage({
    overview,
    search,
    status,
    role,
}: AdminUsersPageProps) {
    return (
        <>
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>
                        TA’LIMOT ADMIN
                    </span>

                    <h1>Foydalanuvchilar</h1>

                    <p>
                        Ro‘yxatdan o‘tgan foydalanuvchilar, Telegram tasdiqlashi
                        va akkaunt holatini boshqaring.
                    </p>
                </div>

                <a className={styles.openPlatform} href="/" target="_blank">
                    Student platformani ochish
                </a>
            </header>

            <section className={styles.statsGrid}>
                <article>
                    <span>Jami foydalanuvchi</span>
                    <strong>{overview.totalCount}</strong>
                </article>

                <article>
                    <span>Faol</span>
                    <strong>{overview.activeCount}</strong>
                </article>

                <article>
                    <span>Bloklangan</span>
                    <strong>{overview.blockedCount}</strong>
                </article>

                <article>
                    <span>Telefon tasdiqlangan</span>
                    <strong>{overview.verifiedCount}</strong>
                </article>
            </section>

            <section className={styles.catalogCard}>
                <form className={styles.filters} method="get">
                    <label className={styles.searchField}>
                        <span>Qidiruv</span>
                        <input
                            type="search"
                            name="q"
                            defaultValue={search}
                            placeholder="Ism, familiya, telefon, Telegram yoki ID..."
                        />
                    </label>

                    <label>
                        <span>Holat</span>
                        <select name="status" defaultValue={status}>
                            <option value="all">Barchasi</option>
                            <option value="active">Faol</option>
                            <option value="blocked">Bloklangan</option>
                        </select>
                    </label>

                    <label>
                        <span>Role</span>
                        <select name="role" defaultValue={role}>
                            <option value="all">Barchasi</option>
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                        </select>
                    </label>

                    <button className={styles.filterButton} type="submit">
                        Filtrlash
                    </button>
                </form>

                <div className={styles.resultBar}>
                    <strong>{overview.filteredCount}</strong>
                    <span>ta foydalanuvchi topildi</span>

                    {overview.filteredCount > 0 ? (
                        <span className={styles.pageRange}>
                            {((overview.page - 1) * overview.pageSize) + 1}
                            –
                            {Math.min(
                                overview.page * overview.pageSize,
                                overview.filteredCount,
                            )}
                            {" "}ko‘rsatilmoqda
                        </span>
                    ) : null}
                </div>

                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>Foydalanuvchi</th>
                                <th>Telefon</th>
                                <th>Telegram</th>
                                <th>Role</th>
                                <th>Tasdiq</th>
                                <th>Holat</th>
                                <th>Ro‘yxatdan o‘tgan</th>
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
                                overview.records.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className={styles.userIdentity}>
                                                <div className={styles.avatar} aria-hidden="true">
                                                    {user.firstName.slice(0, 1).toUpperCase()}
                                                    {user.lastName.slice(0, 1).toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {user.firstName} {user.lastName}
                                                    </strong>
                                                    <span>{user.fatherName}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.phone}</td>
                                        <td>
                                            <div className={styles.telegramCell}>
                                                <strong>
                                                    {telegramLabel(
                                                        user.telegramUsername,
                                                        user.telegramUserId,
                                                    )}
                                                </strong>
                                                {user.telegramUserId ? (
                                                    <span>ID: {user.telegramUserId}</span>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.roleBadge}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    user.phoneVerifiedAt
                                                        ? styles.verifiedBadge
                                                        : styles.unverifiedBadge
                                                }
                                            >
                                                {user.phoneVerifiedAt
                                                    ? "Tasdiqlangan"
                                                    : "Tasdiqlanmagan"}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    user.status === "active"
                                                        ? styles.activeBadge
                                                        : styles.blockedBadge
                                                }
                                            >
                                                {user.status === "active"
                                                    ? "Faol"
                                                    : "Bloklangan"}
                                            </span>
                                        </td>
                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <a
                                                    className={styles.detailsLink}
                                                    href={`/admin/users/${encodeURIComponent(user.id)}`}
                                                >
                                                    Ko‘rish
                                                </a>

                                                <form
                                                    action={`/api/admin/users/${encodeURIComponent(user.id)}/status`}
                                                    method="post"
                                                >
                                                    <input
                                                        type="hidden"
                                                        name="status"
                                                        value={
                                                            user.status === "active"
                                                                ? "blocked"
                                                                : "active"
                                                        }
                                                    />
                                                    <input
                                                        type="hidden"
                                                        name="returnTo"
                                                        value="/admin/users"
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
                                                            ? "Bloklash"
                                                            : "Faollashtirish"}
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {overview.pageCount > 1 ? (
                    <nav
                        className={styles.pagination}
                        aria-label="Foydalanuvchilar sahifalari"
                    >
                        {overview.page > 1 ? (
                            <a
                                href={paginationHref({
                                    page: overview.page - 1,
                                    search,
                                    status,
                                    role,
                                })}
                            >
                                ← Oldingi
                            </a>
                        ) : (
                            <span className={styles.disabledPage}>← Oldingi</span>
                        )}

                        <strong>
                            {overview.page} / {overview.pageCount}
                        </strong>

                        {overview.page < overview.pageCount ? (
                            <a
                                href={paginationHref({
                                    page: overview.page + 1,
                                    search,
                                    status,
                                    role,
                                })}
                            >
                                Keyingi →
                            </a>
                        ) : (
                            <span className={styles.disabledPage}>Keyingi →</span>
                        )}
                    </nav>
                ) : null}

                <p className={styles.catalogNote}>
                    Foydalanuvchilar soni database’dan to‘liq hisoblanadi; jadval
                    tez ishlashi uchun foydalanuvchilar sahifalab ko‘rsatiladi.
                </p>
            </section>
        </>
    );
}
