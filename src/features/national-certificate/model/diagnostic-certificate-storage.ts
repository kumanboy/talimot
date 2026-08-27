export type CertificateOwnerSnapshot = {
    readonly firstName: string;
    readonly lastName: string;
    readonly fatherName: string;
};

export type DiagnosticCertificateResultSnapshot = {
    readonly testTitle: string;
    readonly subject: string;
    readonly testScore: number;
    readonly essayScore: number | null;
    readonly finalScore: number | null;
    readonly grade: string | null;
    readonly score: number;
    readonly maximumScore: 75;
    readonly percentage: number;
    readonly correctCount: number;
    readonly incorrectCount: number;
    readonly unansweredCount: number;
    readonly pendingCount: number;
};

export type DiagnosticCertificateRecord = {
    readonly attemptId: string;
    readonly certificateId: string;
    readonly issuedAt: number;
    readonly owner: CertificateOwnerSnapshot;
    readonly result: DiagnosticCertificateResultSnapshot;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeNumber(value: unknown): number {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function safeNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

export function parseDiagnosticCertificateRecord(value: unknown): DiagnosticCertificateRecord | null {
    if (!isRecord(value) || !isRecord(value.owner) || !isRecord(value.result)) return null;

    const attemptId = typeof value.attemptId === "string" ? value.attemptId : "";
    const certificateId = typeof value.certificateId === "string" ? value.certificateId : "";
    const issuedAt = safeNumber(value.issuedAt);
    const firstName = typeof value.owner.firstName === "string" ? value.owner.firstName : "";
    const lastName = typeof value.owner.lastName === "string" ? value.owner.lastName : "";
    const fatherName = typeof value.owner.fatherName === "string" ? value.owner.fatherName : "";
    const testTitle = typeof value.result.testTitle === "string" ? value.result.testTitle : "To‘liq diagnostika";
    const subject = typeof value.result.subject === "string" ? value.result.subject : "Ona tili va adabiyot";

    if (!attemptId || !certificateId || !issuedAt || !firstName || !lastName) return null;

    const testScore = safeNumber(value.result.testScore ?? value.result.score);
    const essayScore = safeNullableNumber(value.result.essayScore);
    const finalScore = safeNullableNumber(value.result.finalScore);
    const score = safeNumber(value.result.score ?? finalScore ?? testScore);
    const grade = typeof value.result.grade === "string" && value.result.grade.trim()
        ? value.result.grade.trim()
        : null;

    return {
        attemptId,
        certificateId,
        issuedAt,
        owner: { firstName, lastName, fatherName },
        result: {
            testTitle,
            subject,
            testScore,
            essayScore,
            finalScore,
            grade,
            score,
            maximumScore: 75,
            percentage: safeNumber(value.result.percentage),
            correctCount: safeNumber(value.result.correctCount),
            incorrectCount: safeNumber(value.result.incorrectCount),
            unansweredCount: safeNumber(value.result.unansweredCount),
            pendingCount: safeNumber(value.result.pendingCount),
        },
    };
}

export async function fetchDiagnosticCertificateRecord(
    attemptId: string,
): Promise<DiagnosticCertificateRecord | null> {
    const response = await fetch(
        `/api/diagnostic-certificates?attempt=${encodeURIComponent(attemptId)}`,
        { method: "GET", credentials: "include", cache: "no-store" },
    );

    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Sertifikatni yuklab bo‘lmadi.");

    const payload = await response.json() as { certificate?: unknown };
    return parseDiagnosticCertificateRecord(payload.certificate);
}

export async function fetchDiagnosticCertificates(): Promise<readonly DiagnosticCertificateRecord[]> {
    const response = await fetch(
        "/api/diagnostic-certificates",
        { method: "GET", credentials: "include", cache: "no-store" },
    );

    if (!response.ok) throw new Error("Sertifikatlarni yuklab bo‘lmadi.");

    const payload = await response.json() as { certificates?: unknown };
    if (!Array.isArray(payload.certificates)) return [];

    return payload.certificates
        .map(parseDiagnosticCertificateRecord)
        .filter((item): item is DiagnosticCertificateRecord => item !== null)
        .sort((a, b) => b.issuedAt - a.issuedAt);
}
