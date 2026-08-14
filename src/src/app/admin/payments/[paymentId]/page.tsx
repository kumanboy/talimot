import { notFound, redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { AdminPaymentDetailsPage } from "@/features/admin/payments/components/admin-payment-details-page";
import { getAdminPayment } from "@/features/admin/payments/server/get-admin-payments";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ paymentId: string }>;
    searchParams: Promise<{ status?: string | string[] }>;
}

function first(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminPaymentDetailsRoute({ params, searchParams }: Props) {
    if (!(await hasValidAdminSession())) {
        redirect("/admin/login");
    }

    const { paymentId } = await params;
    const payment = await getAdminPayment(paymentId);

    if (!payment) {
        notFound();
    }

    const query = await searchParams;

    return (
        <AdminShell activeItem="payments">
            <AdminPaymentDetailsPage
                payment={payment}
                statusMessage={first(query.status)}
            />
        </AdminShell>
    );
}
