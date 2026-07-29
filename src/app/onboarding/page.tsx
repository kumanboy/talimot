"use client";

import { OnboardingWelcome } from "@/components/onboarding/onboarding-welcome";

export default function OnboardingPage() {
  const handleStart = () => {
    // TODO(onboarding-step-1): Wire this callback to the approved first-question
    // screen after that screen has been designed and implemented.
  };

  return <OnboardingWelcome onStart={handleStart} />;
}
