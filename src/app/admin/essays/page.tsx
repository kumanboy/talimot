import { redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { AdminEssayQueuePage } from "@/features/admin/essays/components/admin-essay-queue-page";
import { getAdminEssayQueue } from "@/features/admin/essays/server/get-admin-essay-submissions";
import { hasValidAdminSession } from "@/features/admin/model/admin-session";

export const dynamic = "force-dynamic";

type Props = {
    readonly searchParams: Promise<{
        q?: string | string[];
        status?: string | string[];
        reviewType?: string | string[];
    }>;
};

function first(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminEssaysRoute({ searchParams }: Props) {
    if (!(await hasValidAdminSession())) redirect("/admin/login");

    const params = await searchParams;
    const search = first(params.q).trim().slice(0, 80);
    const status = first(params.status).trim();
    const reviewType = first(params.reviewType).trim();
    const overview = await getAdminEssayQueue({ search, status, reviewType });

    return <AdminShell activeItem="essays"><AdminEssayQueuePage overview={overview} search={search} status={status} reviewType={reviewType} /></AdminShell>;
}
