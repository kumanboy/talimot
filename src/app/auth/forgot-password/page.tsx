import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

type ForgotPasswordPageProps = {
    searchParams: Promise<{
        next?: string | string[];
    }>;
};

function getSafeDestination(
    value: string | string[] | undefined,
): string {
    const destination = Array.isArray(value) ? value[0] : value;

    if (
        !destination ||
        !destination.startsWith("/") ||
        destination.startsWith("//")
    ) {
        return "/yol-xaritasi?mode=from-zero&view=full";
    }

    return destination;
}

export default async function ForgotPasswordPage({
                                                     searchParams,
                                                 }: ForgotPasswordPageProps) {
    const params = await searchParams;
    const destination = getSafeDestination(params.next);

    return <ForgotPasswordForm destination={destination} />;
}