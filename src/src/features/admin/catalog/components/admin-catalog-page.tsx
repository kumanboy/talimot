import type { AdminCatalogRecord } from "@/features/catalog/model/catalog-types";

import styles from "./admin-catalog-page.module.css";

function formatPrice(value: number): string {
    return `${new Intl.NumberFormat("uz-UZ").format(value)} so‘m`;
}

function kindLabel(kind: string): string {
    return kind === "book" ? "Kitob" : "Kurs";
}

function statusLabel(status: string): string {
    if (status === "published") return "Published";
    if (status === "archived") return "Archived";
    return "Draft";
}

export function AdminCatalogPage({ records }: { readonly records: readonly AdminCatalogRecord[] }) {
    const books = records.filter((item) => item.kind === "book");
    const courses = records.filter((item) => item.kind === "course");
    const published = records.filter((item) => item.status === "published").length;

    return (
        <>
            <header className={styles.header}>
                <div>
                    <span>TA’LIMOT ADMIN</span>
                    <h1>Kurslar va kitoblar</h1>
                    <p>
                        Katalog, narx, chegirma, cover, sotuv holati va student tarafda
                        ko‘rinishini bitta joydan boshqaring.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <a href="/admin/products/book/new">+ Kitob qo‘shish</a>
                    <a href="/admin/products/course/new">+ Kurs qo‘shish</a>
                </div>
            </header>

            <section className={styles.statsGrid}>
                <article><span>Jami mahsulot</span><strong>{records.length}</strong></article>
                <article><span>Published</span><strong>{published}</strong></article>
                <article><span>Kitoblar</span><strong>{books.length}</strong></article>
                <article><span>Kurslar</span><strong>{courses.length}</strong></article>
            </section>

            <CatalogSection title="Kitoblar" records={books} />
            <CatalogSection title="Kurslar" records={courses} />
        </>
    );
}

function CatalogSection({ title, records }: { title: string; records: readonly AdminCatalogRecord[] }) {
    return (
        <section className={styles.card}>
            <div className={styles.heading}>
                <div>
                    <span>KATALOG</span>
                    <h2>{title}</h2>
                </div>
                <p>{records.length} ta yozuv</p>
            </div>

            <div className={styles.tableWrap}>
                <table>
                    <thead>
                        <tr>
                            <th>Mahsulot</th>
                            <th>Turi</th>
                            <th>Narx</th>
                            <th>Chegirma narxi</th>
                            <th>Holat</th>
                            <th>Manba</th>
                            <th>Amal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((item) => (
                            <tr key={`${item.kind}:${item.slug}`}>
                                <td>
                                    <strong>{item.title}</strong>
                                    <small>/{item.kind === "book" ? "kitoblar" : "kurslar"}/{item.slug}</small>
                                </td>
                                <td>{kindLabel(item.kind)}</td>
                                <td>{formatPrice(item.originalPrice)}</td>
                                <td><strong>{formatPrice(item.salePrice)}</strong></td>
                                <td>
                                    <span className={`${styles.status} ${styles[item.status]}`}>
                                        {statusLabel(item.status)}
                                    </span>
                                </td>
                                <td>{item.source === "database" ? "Database" : "Kod → DB ga o‘tkazish mumkin"}</td>
                                <td>
                                    <a className={styles.editLink} href={`/admin/products/${item.kind}/${encodeURIComponent(item.slug)}`}>
                                        Tahrirlash
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
