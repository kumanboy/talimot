export type UserProfile = {
    readonly firstName: string;
    readonly lastName: string;
    readonly fatherName: string;
    readonly phone: string;
    readonly telegramUsername: string;
};

export const PROFILE_STORAGE_KEY =
    "talimot:user-profile:v1";

export const defaultUserProfile: UserProfile = {
    firstName: "",
    lastName: "",
    fatherName: "",
    phone: "",
    telegramUsername: "",
};

function normalizeProfile(
    value: Partial<UserProfile> | null,
): UserProfile {
    return {
        firstName:
            typeof value?.firstName === "string"
                ? value.firstName
                : defaultUserProfile.firstName,
        lastName:
            typeof value?.lastName === "string"
                ? value.lastName
                : defaultUserProfile.lastName,
        fatherName:
            typeof value?.fatherName === "string"
                ? value.fatherName
                : defaultUserProfile.fatherName,
        phone:
            typeof value?.phone === "string"
                ? value.phone
                : defaultUserProfile.phone,
        telegramUsername:
            typeof value?.telegramUsername === "string"
                ? value.telegramUsername
                : defaultUserProfile.telegramUsername,
    };
}

export function readUserProfile(): UserProfile {
    if (typeof window === "undefined") {
        return defaultUserProfile;
    }

    try {
        const raw =
            window.localStorage.getItem(
                PROFILE_STORAGE_KEY,
            );

        if (!raw) {
            return defaultUserProfile;
        }

        return normalizeProfile(
            JSON.parse(raw) as Partial<UserProfile>,
        );
    } catch {
        return defaultUserProfile;
    }
}

export function saveUserProfile(
    profile: UserProfile,
): UserProfile {
    const normalized =
        normalizeProfile(profile);

    if (typeof window !== "undefined") {
        window.localStorage.setItem(
            PROFILE_STORAGE_KEY,
            JSON.stringify(normalized),
        );
    }

    return normalized;
}

export function isCertificateProfileComplete(
    profile: UserProfile,
): boolean {
    return (
        profile.firstName.trim().length >= 2 &&
        profile.lastName.trim().length >= 2 &&
        profile.fatherName.trim().length >= 2
    );
}

export function getProfileFullName(
    profile: UserProfile,
): string {
    return [
        profile.firstName,
        profile.lastName,
    ]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" ");
}
