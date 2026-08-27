import type { Metadata } from "next";

import { DiagnosticResultCalculator } from "@/features/national-certificate/components/diagnostic-result-calculator";

export const metadata: Metadata = {
    title: "Natija hisoblagich | TA’LIMOT",
    description: "Test va esse ballari asosida yakuniy natija va darajani hisoblang.",
};

export default function ResultCalculatorPage() {
    return <DiagnosticResultCalculator />;
}
