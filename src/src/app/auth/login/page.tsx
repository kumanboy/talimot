import { LoginForm } from "@/features/auth/components/login-form";

type LoginPageProps = {
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
        return "/yol-xaritasi";
    }

    return destination;
}

export default async function LoginPage({
                                            searchParams,
                                        }: LoginPageProps) {
    const params = await searchParams;
    const destination = getSafeDestination(params.next);

    return <LoginForm destination={destination} />;
}