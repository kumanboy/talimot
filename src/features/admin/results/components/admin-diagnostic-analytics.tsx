import {
    TalimotLogo,
} from "@/components/brand/talimot-logo";
import type {
    AdminDiagnosticAnalytics,
    AdminDiagnosticItemMetric,
} from "@/features/admin/results/server/get-diagnostic-analytics";

import {
    CorrectAnswersChart,
    GradeDistributionChart,
    RaschDifficultyChart,
} from "./admin-diagnostic-charts";
import styles from "./admin-diagnostic-analytics.module.css";

function formatNumber(value: number): string {
    return new Intl.NumberFormat("uz-UZ").format(value);
}

function calibrationLabel(analytics: AdminDiagnosticAnalytics): string {
    if (analytics.raschUsers === 0) return "Ma’lumot kutilmoqda";
    if (analytics.raschUsers < 30) return "Dastlabki kalibratsiya";
    if (analytics.raschUsers < 100) return "Yetarli namuna";
    return "Barqaror namuna";
}

function difficultyLabel(value: number): string {
    if (value >= 1) return "Juda qiyin";
    if (value >= 0.5) return "Qiyin";
    if (value > -0.5) return "O‘rtacha";
    if (value > -1) return "Oson";
    return "Juda oson";
}

function ItemRanking({
    title,
    description,
    items,
}: {
    readonly title: string;
    readonly description: string;
    readonly items: readonly AdminDiagnosticItemMetric[];
}) {
    return (
        <article className={styles.rankingCard}>
            <div className={styles.rankingHeader}>
                <div>
                    <span>RASCH 1PL</span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>
            </div>

            {items.length > 0 ? (
                <ol className={styles.rankingList}>
                    {items.map((item) => (
                        <li key={item.itemKey}>
                            <strong>{item.itemKey}</strong>
                            <div>
                                <span>{difficultyLabel(item.raschDifficulty)}</span>
                                <small>{item.correctRate.toFixed(1)}% to‘g‘ri</small>
                            </div>
                            <b>{item.raschDifficulty.toFixed(2)}</b>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className={styles.emptySmall}>Hali item-level ma’lumot yo‘q.</p>
            )}
        </article>
    );
}

export function AdminDiagnosticAnalyticsPage({
    analytics,
}: {
    readonly analytics: AdminDiagnosticAnalytics;
}) {
    const missingHistoricalUsers = Math.max(
        0,
        analytics.totalUsers - analytics.raschUsers,
    );

    return (
        <div className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>TA’LIMOT ADMIN · DIAGNOSTIKA</span>
                    <h1>Diagnostika analitikasi</h1>
                    <p>
                        Real foydalanuvchi urinishlari, savol kesimidagi natijalar va Rasch 1PL qiyinlik kalibratsiyasi.
                    </p>
                </div>
                <div className={styles.headerBrand}>
                    <TalimotLogo className={styles.headerLogo} />
                    <span>REAL DATA</span>
                </div>
            </header>

            <section className={styles.filterCard}>
                <form method="get" action="/admin/results">
                    <label htmlFor="diagnostic-test-filter">Diagnostikani tanlang</label>
                    <div className={styles.filterControls}>
                        <select
                            id="diagnostic-test-filter"
                            name="testId"
                            defaultValue={analytics.selectedDiagnostic?.id ?? ""}
                        >
                            {analytics.diagnostics.map((diagnostic) => (
                                <option key={diagnostic.id} value={diagnostic.id}>
                                    {diagnostic.title} · {diagnostic.status}
                                </option>
                            ))}
                        </select>
                        <button type="submit">Ko‘rsatish</button>
                    </div>
                </form>

                {analytics.selectedDiagnostic ? (
                    <div className={styles.selectedTestMeta}>
                        <span>{analytics.selectedDiagnostic.status}</span>
                        <strong>{analytics.selectedDiagnostic.title}</strong>
                        <small>/{analytics.selectedDiagnostic.slug}</small>
                    </div>
                ) : null}
            </section>

            {!analytics.selectedDiagnostic ? (
                <section className={styles.emptyState}>
                    <h2>Diagnostika topilmadi</h2>
                    <p>Admin testlarida diagnostika formatidagi test mavjud emas.</p>
                </section>
            ) : (
                <>
                    <section className={styles.statGrid}>
                        <article>
                            <span>Jami urinishlar</span>
                            <strong>{formatNumber(analytics.totalAttempts)}</strong>
                            <small>Barcha diagnostika yakunlashlari</small>
                        </article>
                        <article>
                            <span>Foydalanuvchilar</span>
                            <strong>{formatNumber(analytics.totalUsers)}</strong>
                            <small>Esse kiritilmagan: {formatNumber(analytics.noEssayUsers)}</small>
                        </article>
                        <article>
                            <span>Rasch namuna</span>
                            <strong>{formatNumber(analytics.raschUsers)}</strong>
                            <small>{calibrationLabel(analytics)}</small>
                        </article>
                        <article>
                            <span>Kalibratsiya itemlari</span>
                            <strong>{formatNumber(analytics.raschItems)}</strong>
                            <small>40a/40b kabi qismlar alohida item</small>
                        </article>
                    </section>

                    {missingHistoricalUsers > 0 ? (
                        <section className={styles.historyNotice}>
                            <strong>Tarixiy ma’lumot eslatmasi</strong>
                            <p>
                                {formatNumber(missingHistoricalUsers)} foydalanuvchining eski diagnostika urinishlarida per-savol javoblar DB’da saqlanmagan. Ular umumiy urinish/daraja statistikalarida ko‘rinadi, Rasch va savol grafiklariga esa item-level ma’lumot saqlangan keyingi urinishidan boshlab kiradi.
                            </p>
                        </section>
                    ) : null}

                    <section className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <div>
                                <span>TA’LIMOT · DARAJA</span>
                                <h2>Foydalanuvchilar darajasi bo‘yicha taqsimot</h2>
                                <p>Har bir foydalanuvchining eng so‘nggi yakuniy natijasi olinadi. Esse kiritilmaganlar daraja grafigiga qo‘shilmaydi.</p>
                            </div>
                            <TalimotLogo className={styles.chartLogo} />
                        </div>
                        <div className={styles.chartViewport}>
                            <GradeDistributionChart data={analytics.gradeDistribution} />
                        </div>
                    </section>

                    {analytics.itemMetrics.length > 0 ? (
                        <>
                            <section className={styles.chartCard}>
                                <div className={styles.chartHeader}>
                                    <div>
                                        <span>TA’LIMOT · ITEM ANALYSIS</span>
                                        <h2>Har bir savol bo‘yicha to‘g‘ri javoblar soni</h2>
                                        <p>Bir foydalanuvchi Rasch/item tahlilida faqat bir marta hisoblanadi.</p>
                                    </div>
                                    <TalimotLogo className={styles.chartLogo} />
                                </div>
                                <div className={styles.wideChartViewport}>
                                    <CorrectAnswersChart data={analytics.itemMetrics} />
                                </div>
                            </section>

                            <section className={styles.chartCard}>
                                <div className={styles.chartHeader}>
                                    <div>
                                        <span>TA’LIMOT · RASCH 1PL</span>
                                        <h2>Savollar qiyinlik darajasi</h2>
                                        <p>
                                            0 — 50% to‘g‘ri javob nuqtasi. Musbat logit — qiyinroq, manfiy logit — osonroq. Formula: b = ln((1−p)/p).
                                        </p>
                                    </div>
                                    <div className={styles.calibrationBadge}>
                                        <strong>{analytics.raschConverged ? "Hisob tayyor" : "Ma’lumot kutilmoqda"}</strong>
                                        <small>p-value → Rasch logit</small>
                                    </div>
                                </div>
                                <div className={styles.raschLegend}>
                                    <span><i className={styles.hardLegend} /> Musbat = qiyinroq</span>
                                    <span><i className={styles.easyLegend} /> Manfiy = osonroq</span>
                                </div>
                                <div className={styles.wideChartViewport}>
                                    <RaschDifficultyChart data={analytics.itemMetrics} />
                                </div>
                            </section>

                            <section className={styles.rankingGrid}>
                                <ItemRanking
                                    title="Eng qiyin 5 item"
                                    description="Rasch b qiymati eng yuqori savollar."
                                    items={analytics.hardestItems}
                                />
                                <ItemRanking
                                    title="Eng oson 5 item"
                                    description="Rasch b qiymati eng past savollar."
                                    items={analytics.easiestItems}
                                />
                            </section>

                            <section className={styles.tableCard}>
                                <div className={styles.chartHeader}>
                                    <div>
                                        <span>TA’LIMOT · ANIQ SONLAR</span>
                                        <h2>Savollar kesimidagi jadval</h2>
                                        <p>Grafikdagi har bir qiymatning real agregat ko‘rinishi.</p>
                                    </div>
                                </div>
                                <div className={styles.tableViewport}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Savol</th>
                                                <th>N</th>
                                                <th>To‘g‘ri</th>
                                                <th>Noto‘g‘ri</th>
                                                <th>Javobsiz</th>
                                                <th>To‘g‘ri %</th>
                                                <th>Rasch b</th>
                                                <th>SE</th>
                                                <th>Talqin</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.itemMetrics.map((item) => (
                                                <tr key={item.itemKey}>
                                                    <td><strong>{item.itemKey}</strong></td>
                                                    <td>{formatNumber(item.respondentCount)}</td>
                                                    <td>{formatNumber(item.correctCount)}</td>
                                                    <td>{formatNumber(item.incorrectCount)}</td>
                                                    <td>{formatNumber(item.unansweredCount)}</td>
                                                    <td>{item.correctRate.toFixed(1)}%</td>
                                                    <td>{item.raschDifficulty.toFixed(2)}</td>
                                                    <td>{item.standardError === null ? "—" : item.standardError.toFixed(2)}</td>
                                                    <td>{difficultyLabel(item.raschDifficulty)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    ) : (
                        <section className={styles.emptyState}>
                            <h2>Rasch uchun yangi item-level ma’lumot kutilmoqda</h2>
                            <p>
                                Yangi versiya ishga tushgandan keyin foydalanuvchilar diagnostikani yakunlaganda 1–44 va 40a/40b kabi qismlar serverdan DB’ga saqlanadi. Shundan so‘ng grafiklar avtomatik real ma’lumot bilan to‘ladi.
                            </p>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
