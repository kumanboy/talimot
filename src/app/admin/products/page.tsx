import { connection } from "next/server";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { AdminCatalogPage } from "@/features/admin/catalog/components/admin-catalog-page";
import { getAdminCatalogRecords } from "@/features/catalog/server/catalog-repository";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
    await connection();
    const records = await getAdminCatalogRecords();

    return (
        <AdminShell activeItem="products">
            <AdminCatalogPage records={records} />
        </AdminShell>
    );
}
