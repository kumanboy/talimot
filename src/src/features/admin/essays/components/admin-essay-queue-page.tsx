import type { AdminEssayQueueOverview } from "../server/get-admin-essay-submissions";

import styles from "./admin-essay-queue-page.module.css";

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

function statusLabel(status: string): string {
    if (status === "pending") return "Kutilmoqda";
    if (status === "processing") return "AI ishlayapti";
    if (status === "in_review") return "Tekshiruvda";
    if (status === "completed") return "Yakunlangan";
    if (status === "failed") return "Xatolik";
    if (status === "cancelled") return "Bekor qilingan";
    return status;
}

export function AdminEssayQueuePage({
    overview,
    search,
    status,
    reviewType,
}: {
    readonly overview: AdminEssayQueueOverview;
    readonly search: string;
    readonly status: string;
    readonly reviewType: string;
}) {
    return (
        <>
            <header className={styles.header}>
                <div>
                    <span>TA’LIMOT ADMIN · ESSE</span>
                    <h1>Esse tekshiruvlari</h1>
                    <p>AI natijalari va ustozga yuborilgan matn/rasm esselarini bitta navbatdan boshqaring.</p>
                </div>
            </header>

            <section className={styles.stats}>
                <article><span>Jami</span><strong>{overview.totalCount}</strong></article>
                <article><span>Ustoz kutmoqda</span><strong>{overview.teacherPendingCount}</strong></article>
                <article><span>Tekshiruvda</span><strong>{overview.inReviewCount}</strong></article>
                <article><span>Yakunlangan</span><strong>{overview.completedCount}</strong></article>
            </section>

            <section className={styles.card}>
                <div className={styles.heading}>
                    <div><span>TEACHER QUEUE</span><h2>Tekshiruv navbati</h2></div>
                    <p>{overview.records.length} ta yozuv</p>
                </div>

                <form className={styles.filters} method="get">
                    <label><span>Qidiruv</span><input name="q" defaultValue={search} placeholder="User ID, telefon, ism, mavzu..." /></label>
                    <label><span>Holat</span><select name="status" defaultValue={status}><option value="">Barchasi</option><option value="pending">Kutilmoqda</option><option value="in_review">Tekshiruvda</option><option value="processing">AI ishlayapti</option><option value="completed">Yakunlangan</option><option value="failed">Xatolik</option></select></label>
                    <label><span>Turi</span><select name="reviewType" defaultValue={reviewType}><option value="">Barchasi</option><option value="teacher">Ustoz</option><option value="ai">AI</option></select></label>
                    <button type="submit">Qidirish</button>
                    <a href="/admin/essays">Tozalash</a>
                </form>

                <div className={styles.tableWrap}>
                    <table>
                        <thead><tr><th>Vaqt</th><th>Foydalanuvchi</th><th>Tekshiruv</th><th>Format</th><th>Mavzu</th><th>Narx</th><th>Holat</th><th>Amal</th></tr></thead>
                        <tbody>
                            {overview.records.length === 0 ? <tr><td className={styles.empty} colSpan={8}>Hozircha esse submission yo‘q. Student-side real yuborish keyingi bosqichda ulanadi.</td></tr> : overview.records.map((record) => (
                                <tr key={record.id}>
                                    <td>{formatDate(record.submittedAt)}</td>
                                    <td><strong>{record.fullName}</strong><small>ID {record.userNumber} · {record.phone}</small></td>
                                    <td><span className={styles.typeBadge}>{record.reviewType === "teacher" ? "Ustoz" : "AI"}</span></td>
                                    <td>{record.submissionType === "images" ? "Rasm" : "Matn"}</td>
                                    <td><strong>{record.topic}</strong><small>{record.sourceType === "diagnostic" ? "Diagnostika" : "Alohida esse"}</small></td>
                                    <td>{record.tangaCost} Tanga</td>
                                    <td><span className={`${styles.statusBadge} ${styles[record.status]}`}>{statusLabel(record.status)}</span></td>
                                    <td><span className={styles.comingSoon}>{record.reviewType === "teacher" ? "Tekshirish" : "Ko‘rish"}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className={styles.architecture}>
                <strong>Teacher grading screen — keyingi integration</strong>
                <p>Essay text yoki private rasmlar chap tomonda; rubric ballari, yozma feedback va audio feedback o‘ng tomonda. “Yakunlash” bosilgandan keyingina diagnostika final certificate yaratiladi.</p>
            </section>
        </>
    );
}
