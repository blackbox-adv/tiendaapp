// Onboarding requires auth and browser APIs — force dynamic rendering
export const dynamic = 'force-dynamic';

import OnboardingClient from './OnboardingClient';

export default function OnboardingPage() {
  return <OnboardingClient />;
}
