import { RegistrationForm } from "@/features/auth/components/registration-form";

type RegistrationPageProps = {
    searchParams: Promise<{
        next?: string | string[];
        roadmapMode?: string | string[];
    }>;
};

function getSafeDestination(value: string | string[] | undefined) {
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

function getSafeRoadmapMode(value: string | string[] | undefined) {
    const mode = Array.isArray(value) ? value[0] : value;
    return mode === "boost" ? "boost" : "from-zero";
}

export default async function RegistrationPage({
                                                   searchParams,
                                               }: RegistrationPageProps) {
    const params = await searchParams;
    const destination = getSafeDestination(params.next);
    const roadmapMode = getSafeRoadmapMode(params.roadmapMode);

    return (
        <RegistrationForm
            destination={destination}
            roadmapMode={roadmapMode}
        />
    );
}