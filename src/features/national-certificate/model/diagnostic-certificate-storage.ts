import {
    isCertificateProfileComplete,
} from "@/features/profile/model/profile-storage";
import type {
    UserProfile,
} from "@/features/profile/model/profile-storage";

export type CertificateOwnerSnapshot = {
    readonly firstName: string;
    readonly lastName: string;
    readonly fatherName: string;
};

export type DiagnosticCertificateResultSnapshot = {
    readonly testTitle: string;
    readonly subject: string;
    readonly score: number;
    readonly maximumScore: number;
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

const CERTIFICATE_STORAGE_PREFIX =
    "talimot:diagnostic-certificate:v2:";

function getStorageKey(
    attemptId: string,
): string {
    return `${CERTIFICATE_STORAGE_PREFIX}${attemptId}`;
}

function safeNumber(
    value: unknown,
): number {
    return typeof value === "number" &&
        Number.isFinite(value)
        ? value
        : 0;
}

function createCertificateId(
    attemptId: string,
    issuedAt: number,
): string {
    const date = new Date(issuedAt);

    const datePart = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("");

    const attemptPart = attemptId
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(-8)
        .toUpperCase()
        .padStart(8, "0");

    return `TLM-DIAG-${datePart}-${attemptPart}`;
}

export function createDiagnosticCertificateRecord({
    attemptId,
    profile,
    testTitle,
    score,
    maximumScore,
    percentage,
    correctCount,
    incorrectCount,
    unansweredCount,
    pendingCount,
    issuedAt = Date.now(),
}: {
    readonly attemptId: string;
    readonly profile: UserProfile;
    readonly testTitle: string;
    readonly score: number;
    readonly maximumScore: number;
    readonly percentage: number;
    readonly correctCount: number;
    readonly incorrectCount: number;
    readonly unansweredCount: number;
    readonly pendingCount: number;
    readonly issuedAt?: number;
}): DiagnosticCertificateRecord | null {
    if (!isCertificateProfileComplete(profile)) {
        return null;
    }

    const record: DiagnosticCertificateRecord = {
        attemptId,
        certificateId:
            createCertificateId(
                attemptId,
                issuedAt,
            ),
        issuedAt,
        owner: {
            firstName: profile.firstName.trim(),
            lastName: profile.lastName.trim(),
            fatherName: profile.fatherName.trim(),
        },
        result: {
            testTitle: testTitle.trim() || "To‘liq diagnostika",
            subject: "Ona tili va adabiyot",
            score: safeNumber(score),
            maximumScore: safeNumber(maximumScore),
            percentage: safeNumber(percentage),
            correctCount: safeNumber(correctCount),
            incorrectCount: safeNumber(incorrectCount),
            unansweredCount: safeNumber(unansweredCount),
            pendingCount: safeNumber(pendingCount),
        },
    };

    if (typeof window !== "undefined") {
        window.localStorage.setItem(
            getStorageKey(attemptId),
            JSON.stringify(record),
        );
    }

    return record;
}

function parseRecord(
    raw: string,
): DiagnosticCertificateRecord | null {
    try {
        const parsed =
            JSON.parse(raw) as
                Partial<DiagnosticCertificateRecord>;

        if (
            typeof parsed.attemptId !== "string" ||
            typeof parsed.certificateId !== "string" ||
            typeof parsed.issuedAt !== "number" ||
            !parsed.owner ||
            typeof parsed.owner.firstName !== "string" ||
            typeof parsed.owner.lastName !== "string" ||
            typeof parsed.owner.fatherName !== "string" ||
            !parsed.result ||
            typeof parsed.result.testTitle !== "string"
        ) {
            return null;
        }

        return {
            attemptId: parsed.attemptId,
            certificateId: parsed.certificateId,
            issuedAt: parsed.issuedAt,
            owner: {
                firstName: parsed.owner.firstName,
                lastName: parsed.owner.lastName,
                fatherName: parsed.owner.fatherName,
            },
            result: {
                testTitle: parsed.result.testTitle,
                subject:
                    typeof parsed.result.subject === "string"
                        ? parsed.result.subject
                        : "Ona tili va adabiyot",
                score: safeNumber(parsed.result.score),
                maximumScore:
                    safeNumber(parsed.result.maximumScore),
                percentage:
                    safeNumber(parsed.result.percentage),
                correctCount:
                    safeNumber(parsed.result.correctCount),
                incorrectCount:
                    safeNumber(parsed.result.incorrectCount),
                unansweredCount:
                    safeNumber(parsed.result.unansweredCount),
                pendingCount:
                    safeNumber(parsed.result.pendingCount),
            },
        };
    } catch {
        return null;
    }
}

export function readDiagnosticCertificateRecord(
    attemptId: string,
): DiagnosticCertificateRecord | null {
    if (typeof window === "undefined") {
        return null;
    }

    const raw =
        window.localStorage.getItem(
            getStorageKey(attemptId),
        );

    return raw ? parseRecord(raw) : null;
}

export function readDiagnosticCertificates():
    readonly DiagnosticCertificateRecord[] {
    if (typeof window === "undefined") {
        return [];
    }

    const records:
        DiagnosticCertificateRecord[] = [];

    for (
        let index = 0;
        index < window.localStorage.length;
        index += 1
    ) {
        const key =
            window.localStorage.key(index);

        if (
            !key ||
            !key.startsWith(
                CERTIFICATE_STORAGE_PREFIX,
            )
        ) {
            continue;
        }

        const raw =
            window.localStorage.getItem(key);

        if (!raw) {
            continue;
        }

        const record =
            parseRecord(raw);

        if (record) {
            records.push(record);
        }
    }

    return records.sort(
        (first, second) =>
            second.issuedAt - first.issuedAt,
    );
}
