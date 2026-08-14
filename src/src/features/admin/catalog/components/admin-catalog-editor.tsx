import type { BookDefinition } from "@/features/books/model/book-types";
import type { CourseDefinition } from "@/features/courses/model/course-types";
import type { CatalogKind } from "@/features/catalog/model/catalog-types";

import styles from "./admin-catalog-editor.module.css";

type Props = {
    readonly kind: CatalogKind;
    readonly item: BookDefinition | CourseDefinition | null;
    readonly isNew: boolean;
    readonly saved: boolean;
};

function lines(values: readonly string[] | undefined): string {
    return values?.join("\n") ?? "";
}

function modulesJson(item: CourseDefinition | null): string {
    return item ? JSON.stringify(item.modules, null, 2) : "[]";
}

export function AdminCatalogEditor({ kind, item, isNew, saved }: Props) {
    const book = item && "author" in item ? item : null;
    const course = item && "instructor" in item ? item : null;
    const sale = item?.sale;

    return (
        <>
            <header className={styles.header}>
                <div>
                    <a href="/admin/products">← Katalogga qaytish</a>
                    <span>TA’LIMOT ADMIN</span>
                    <h1>{isNew ? (kind === "book" ? "Yangi kitob" : "Yangi kurs") : item?.title}</h1>
                    <p>Student katalogi, home page va payment flow shu ma’lumotlardan foydalanadi.</p>
                </div>
            </header>

            {saved ? <div className={styles.success}>O‘zgarishlar database’da saqlandi.</div> : null}

            <form className={styles.form} action="/api/admin/catalog/save" method="post">
                <input type="hidden" name="kind" value={kind} />
                <input type="hidden" name="originalSlug" value={isNew ? "" : item?.slug ?? ""} />

                <section className={styles.card}>
                    <div className={styles.heading}><span>ASOSIY</span><h2>Mahsulot ma’lumotlari</h2></div>
                    <div className={styles.grid}>
                        <label><span>Nomi</span><input required name="title" defaultValue={item?.title ?? ""} /></label>
                        <label><span>Slug</span><input required name="slug" readOnly={!isNew} defaultValue={isNew ? "" : item?.slug ?? ""} placeholder="grammatika" /></label>
                        <label><span>Holat</span><select name="status" defaultValue={item?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
                        <label><span>Tartib</span><input name="sortOrder" type="number" min="0" defaultValue="0" /></label>
                        <label className={styles.wide}><span>Qisqa tavsif</span><textarea name="shortDescription" rows={3} defaultValue={item?.shortDescription ?? ""} /></label>
                        <label className={styles.wide}><span>Batafsil tavsif — har paragraf yangi qatorda</span><textarea name="fullDescription" rows={6} defaultValue={lines(item?.fullDescription)} /></label>
                    </div>
                </section>

                <section className={styles.card}>
                    <div className={styles.heading}><span>SOTUV</span><h2>Narx va chegirma</h2></div>
                    <div className={styles.grid}>
                        <label><span>Asl narx (so‘m)</span><input name="originalPrice" type="number" min="0" required defaultValue={sale?.originalPrice ?? 0} /></label>
                        <label><span>Sotuv narxi (so‘m)</span><input name="salePrice" type="number" min="0" required defaultValue={sale?.salePrice ?? 0} /></label>
                        <label><span>Chegirma tugash vaqti</span><input name="saleEndsAt" defaultValue={sale?.endsAt ?? "2099-12-31T23:59:59+05:00"} /></label>
                        <label><span>Badge</span><input name="badge" defaultValue={item?.badge ?? ""} /></label>
                    </div>
                </section>

                <section className={styles.card}>
                    <div className={styles.heading}><span>MEDIA</span><h2>Cover va ko‘rinish</h2></div>
                    <div className={styles.grid}>
                        <label className={styles.wide}><span>Cover image URL yoki /public path</span><input name="coverImage" defaultValue={item?.coverImage ?? ""} placeholder="/images/home/..." /></label>
                        <label className={styles.wide}><span>Cover alt matni</span><input name="coverImageAlt" defaultValue={item?.coverImageAlt ?? ""} /></label>
                        {kind === "book" ? <label><span>Image position</span><input name="imagePosition" defaultValue={book?.imagePosition ?? "center"} /></label> : null}
                        <label><span>Accent</span><select name="accent" defaultValue={item?.accent ?? (kind === "book" ? "grammar" : "primary")}>
                            {kind === "book" ? <><option value="grammar">Grammar</option><option value="essay">Essay</option><option value="ghazal">G‘azal</option></> : <><option value="primary">Primary</option><option value="violet">Violet</option><option value="orange">Orange</option><option value="teal">Teal</option></>}
                        </select></label>
                    </div>
                </section>

                {kind === "book" ? (
                    <section className={styles.card}>
                        <div className={styles.heading}><span>KITOB</span><h2>Kitob va yetkazib berish</h2></div>
                        <div className={styles.grid}>
                            <label><span>Muallif</span><input name="author" defaultValue={book?.author ?? "Sardor Toshmuhammadov"} /></label>
                            <label><span>Sahifalar</span><input type="number" min="0" name="pageCount" defaultValue={book?.pageCount ?? 0} /></label>
                            <label><span>Format</span><input name="formatLabel" defaultValue={book?.formatLabel ?? "Bosma kitob"} /></label>
                            <label><span>Ombor holati</span><select name="stockStatus" defaultValue={book?.stockStatus ?? "in-stock"}><option value="in-stock">Bor</option><option value="low-stock">Kam qoldi</option><option value="out-of-stock">Tugagan</option></select></label>
                            <label className={styles.wide}><span>Imkoniyatlar — har biri yangi qatorda</span><textarea name="features" rows={5} defaultValue={lines(book?.features)} /></label>
                            <label><span>Yetkazish narxi</span><input name="deliveryPrice" type="number" min="0" defaultValue={book?.delivery.price ?? 35000} /></label>
                            <label><span>Yetkazish nomi</span><input name="deliveryLabel" defaultValue={book?.delivery.label ?? "BTS pochta xizmati"} /></label>
                            <label className={styles.wide}><span>Yetkazish tavsifi</span><textarea name="deliveryDescription" rows={3} defaultValue={book?.delivery.description ?? ""} /></label>
                        </div>
                    </section>
                ) : (
                    <section className={styles.card}>
                        <div className={styles.heading}><span>KURS</span><h2>Kurs tafsilotlari</h2></div>
                        <div className={styles.grid}>
                            <label><span>O‘qituvchi</span><input name="instructorName" defaultValue={course?.instructor.name ?? "Sardor Toshmuhammadov"} /></label>
                            <label><span>O‘qituvchi roli</span><input name="instructorRole" defaultValue={course?.instructor.role ?? "Ona tili va adabiyot fani o‘qituvchisi"} /></label>
                            <label className={styles.wide}><span>O‘qituvchi haqida</span><textarea name="instructorBiography" rows={4} defaultValue={course?.instructor.biography ?? ""} /></label>
                            <label className={styles.wide}><span>Format</span><input name="format" defaultValue={course?.format ?? "Online kurs"} /></label>
                            <label className={styles.wide}><span>Dars jadvali</span><textarea name="schedule" rows={3} defaultValue={course?.schedule ?? ""} /></label>
                            <label className={styles.wide}><span>Kirish tavsifi</span><textarea name="accessDescription" rows={3} defaultValue={course?.accessDescription ?? ""} /></label>
                            <label><span>Foydalanish muddati</span><input name="accessDurationLabel" defaultValue={course?.accessDurationLabel ?? "Cheklanmagan foydalanish"} /></label>
                            <label className={styles.wide}><span>Imkoniyatlar — har biri yangi qatorda</span><textarea name="benefits" rows={5} defaultValue={lines(course?.benefits)} /></label>
                            <label className={styles.wide}><span>Modullar JSON (advanced)</span><textarea name="modulesJson" rows={12} defaultValue={modulesJson(course)} spellCheck={false} /></label>
                        </div>
                    </section>
                )}

                <div className={styles.actions}>
                    <a href="/admin/products">Bekor qilish</a>
                    <button type="submit">Saqlash</button>
                </div>
            </form>
        </>
    );
}
