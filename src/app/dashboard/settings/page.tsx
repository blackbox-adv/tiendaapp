// Dashboard Settings requires auth and browser APIs (localStorage, location)
// Force dynamic rendering to prevent SSR prerendering errors
export const dynamic = 'force-dynamic';

import SettingsClient from './SettingsClient';

export default function SettingsPage() {
  return <SettingsClient />;
}
