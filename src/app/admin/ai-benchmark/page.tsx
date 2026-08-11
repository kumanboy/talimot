import { redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { hasValidAdminSession } from "@/features/admin/model/admin-session";
import { AdminEssayBenchmark } from "@/features/essay-check/benchmark/admin-essay-benchmark";
import { ESSAY_BENCHMARK_CASES } from "@/features/essay-check/benchmark/benchmark-cases";

export const dynamic = "force-dynamic";

export default async function AdminAiBenchmarkPage() {
    if (!(await hasValidAdminSession())) redirect("/admin/login");

    const cases = ESSAY_BENCHMARK_CASES.map((item) => ({
        id: item.id,
        label: item.label,
        topic: item.topic,
        topicWasInferred: Boolean(item.topicWasInferred),
        teacherRawScore: item.teacherRawScore,
        teacherScaledScore: item.teacherScaledScore,
        teacherCriteria: item.teacherCriteria,
    }));

    return (
        <AdminShell activeItem="dashboard">
            <AdminEssayBenchmark cases={cases} />
        </AdminShell>
    );
}
