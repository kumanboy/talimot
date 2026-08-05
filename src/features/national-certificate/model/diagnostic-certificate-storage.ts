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

export type DiagnosticCertificateRecord = {
    readonly attemptId: string;
    readonly certificateId: string;
    readonly issuedAt: number;
    readonly owner: CertificateOwnerSnapshot;
};

const CERTIFICATE_STORAGE_PREFIX =
    "talimot:diagnostic-certificate:v1:";

function getStorageKey(
    attemptId: string,
): string {
    return `${CERTIFICATE_STORAGE_PREFIX}${attemptId}`;
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
    issuedAt = Date.now(),
}: {
    readonly attemptId: string;
    readonly profile: UserProfile;
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
    };

    if (typeof window !== "undefined") {
        window.localStorage.setItem(
            getStorageKey(attemptId),
            JSON.stringify(record),
        );
    }

    return record;
}

export function readDiagnosticCertificateRecord(
    attemptId: string,
): DiagnosticCertificateRecord | null {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const raw =
            window.localStorage.getItem(
                getStorageKey(attemptId),
            );

        if (!raw) {
            return null;
        }

        const parsed =
            JSON.parse(raw) as
                Partial<DiagnosticCertificateRecord>;

        if (
            typeof parsed.certificateId !== "string" ||
            typeof parsed.issuedAt !== "number" ||
            !parsed.owner ||
            typeof parsed.owner.firstName !== "string" ||
            typeof parsed.owner.lastName !== "string" ||
            typeof parsed.owner.fatherName !== "string"
        ) {
            return null;
        }

        return {
            attemptId,
            certificateId: parsed.certificateId,
            issuedAt: parsed.issuedAt,
            owner: {
                firstName: parsed.owner.firstName,
                lastName: parsed.owner.lastName,
                fatherName: parsed.owner.fatherName,
            },
        };
    } catch {
        return null;
    }
}
