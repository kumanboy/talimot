import Link from "next/link";

import type {
    AdminTestDraft,
} from "../model/admin-test-draft-types";

import styles from "./admin-draft-editor-placeholder.module.css";

interface AdminDraftEditorPlaceholderProps {
    readonly draft:
        AdminTestDraft;
}

export function AdminDraftEditorPlaceholder({
    draft,
}: AdminDraftEditorPlaceholderProps) {
    return (
        <>
            <header className={styles.header}>
                <div>
                    <Link
                        href="/admin/tests"
                        className={
                            styles.backLink
                        }
                    >
                        ← Testlar katalogiga qaytish
                    </Link>

                    <span
                        className={
                            styles.eyebrow
                        }
                    >
                        DRAFT YARATILDI
                    </span>

                    <h1>
                        {draft.metadata.title}
                    </h1>

                    <p>
                        Draft Supabase bazasiga
                        saqlandi. Savollar muharriri
                        Step 5.2 da shu sahifaga
                        qo‘shiladi.
                    </p>
                </div>
            </header>

            <section className={styles.card}>
                <div>
                    <span>
                        Draft ID
                    </span>
                    <strong>
                        {draft.id}
                    </strong>
                </div>

                <div>
                    <span>
                        Route
                    </span>
                    <strong>
                        {draft.metadata.group}/
                        {draft.metadata.topicSlug}/
                        {draft.metadata.slug}
                    </strong>
                </div>

                <div>
                    <span>
                        Holat
                    </span>
                    <strong>
                        Draft
                    </strong>
                </div>

                <div>
                    <span>
                        Savollar
                    </span>
                    <strong>
                        {draft.questions.length}
                    </strong>
                </div>
            </section>

            <div className={styles.notice}>
                <strong>
                    Keyingi bosqich
                </strong>
                <p>
                    Multiple-choice savollarni
                    qo‘shish, tahrirlash va
                    Supabase’ga saqlash.
                </p>
            </div>
        </>
    );
}
