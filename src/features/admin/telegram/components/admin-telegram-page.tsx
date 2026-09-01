import styles from "./admin-telegram-page.module.css";

function statusMessage(status: string, sent: string, failed: string, total: string) {
    if (status === "sent") {
        return `Yuborish yakunlandi: ${sent}/${total} ta yuborildi, ${failed} ta muvaffaqiyatsiz.`;
    }
    if (status === "image_required") return "Rasm tanlang.";
    if (status === "image_too_large") return "Rasm 8 MB dan katta bo‘lmasligi kerak.";
    if (status === "image_type") return "Faqat JPG, PNG yoki WEBP rasm yuklang.";
    if (status === "caption_required") return "Post matnini kiriting.";
    if (status === "failed") return "Telegram postini yuborishda xatolik yuz berdi.";
    return "";
}

export function AdminTelegramPage({
    status,
    sent,
    failed,
    total,
    commands,
}: {
    readonly status: string;
    readonly sent: string;
    readonly failed: string;
    readonly total: string;
    readonly commands: string;
}) {
    const message = statusMessage(status, sent, failed, total);

    return (
        <>
            <header className={styles.header}>
                <div>
                    <span>TA’LIMOT ADMIN</span>
                    <h1>Telegram</h1>
                    <p>
                        Faol va Telegram hisobini TA’LIMOTga ulagan foydalanuvchilarga
                        rasm + matn ko‘rinishida post yuboring.
                    </p>
                </div>
            </header>

            {message ? (
                <div className={status === "sent" ? styles.success : styles.error}>
                    {message}
                </div>
            ) : null}

            {commands ? (
                <div className={commands === "updated" ? styles.success : styles.error}>
                    {commands === "updated"
                        ? "Bot buyruqlari yangilandi: /platforma, /start, /balans."
                        : "Bot buyruqlarini yangilab bo‘lmadi. Vercel env va bot tokenini tekshiring."}
                </div>
            ) : null}

            <section className={styles.commandCard}>
                <div>
                    <span>BOT UX</span>
                    <h2>3 ta asosiy buyruq</h2>
                    <p>/platforma · /start · /balans</p>
                </div>
                <form action="/api/admin/telegram/setup" method="post">
                    <button type="submit">Bot buyruqlarini o‘rnatish</button>
                </form>
            </section>

            <section className={styles.card}>
                <div className={styles.heading}>
                    <div>
                        <span>BROADCAST</span>
                        <h2>Rasmli post yuborish</h2>
                    </div>
                    <p>JPG / PNG / WEBP · 8 MB gacha</p>
                </div>

                <form
                    className={styles.form}
                    action="/api/admin/telegram/broadcast"
                    method="post"
                    encType="multipart/form-data"
                >
                    <label>
                        <span>Rasm *</span>
                        <input
                            type="file"
                            name="image"
                            accept="image/jpeg,image/png,image/webp"
                            required
                        />
                    </label>

                    <label>
                        <span>Post matni *</span>
                        <textarea
                            name="caption"
                            maxLength={1000}
                            rows={9}
                            placeholder="Telegram post matnini kiriting..."
                            required
                        />
                        <small>Telegram photo caption limiti uchun 1000 belgigacha.</small>
                    </label>

                    <button type="submit">
                        Rasmli postni yuborish
                    </button>
                </form>
            </section>
        </>
    );
}
