// Reset password requires browser APIs — force dynamic rendering
export const dynamic = 'force-dynamic';

import ResetPasswordClient from './ResetPasswordClient';

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
