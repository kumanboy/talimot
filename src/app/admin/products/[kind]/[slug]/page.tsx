import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { AdminCatalogEditor } from "@/features/admin/catalog/components/admin-catalog-editor";
import { getAdminCatalogItem } from "@/features/admin/catalog/server/get-admin-catalog-item";
import type { CatalogKind } from "@/features/catalog/model/catalog-types";

export const dynamic = "force-dynamic";

type Props = {
    readonly params: Promise<{ kind: string; slug: string }>;
    readonly searchParams: Promise<{ status?: string }>;
};

export default async function AdminProductEditorPage({ params, searchParams }: Props) {
    await connection();
    const { kind: rawKind, slug } = await params;
    const query = await searchParams;
    const kind: CatalogKind | null = rawKind === "book" || rawKind === "course" ? rawKind : null;

    if (!kind) notFound();

    const isNew = slug === "new";
    const item = isNew ? null : await getAdminCatalogItem(kind, slug);

    if (!isNew && !item) notFound();

    return (
        <AdminShell activeItem="products">
            <AdminCatalogEditor
                kind={kind}
                item={item}
                isNew={isNew}
                saved={query.status === "saved"}
            />
        </AdminShell>
    );
}
