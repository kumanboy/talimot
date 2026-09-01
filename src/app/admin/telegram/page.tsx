import { redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { AdminTelegramPage } from "@/features/admin/telegram/components/admin-telegram-page";

export const dynamic = "force-dynamic";

interface Props {
    searchParams: Promise<{
        status?: string | string[];
        total?: string | string[];
        sent?: string | string[];
        failed?: string | string[];
        commands?: string | string[];
    }>;
}

function first(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminTelegramRoute({ searchParams }: Props) {
    if (!(await hasValidAdminSession())) {
        redirect("/admin/login");
    }

    const params = await searchParams;

    return (
        <AdminShell activeItem="telegram">
            <AdminTelegramPage
                status={first(params.status)}
                total={first(params.total)}
                sent={first(params.sent)}
                failed={first(params.failed)}
                commands={first(params.commands)}
            />
        </AdminShell>
    );
}
