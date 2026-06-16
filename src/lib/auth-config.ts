import { authOptions } from './auth';

export { authOptions };

export async function getServerSession() {
  const { getServerSession } = await import('next-auth');
  return getServerSession(authOptions);
}
