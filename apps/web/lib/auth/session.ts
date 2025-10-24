import { authClient } from './auth-client';

export async function getAuthSession() {
  const { data: session, isPending: isLoading } = authClient.useSession();
  if (!session) {
    return null;
  }

  return {
    user: session.user,
    isLoading,
  };
}

export async function requireAdmin() {
  const session = await getAuthSession();

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return session;
}
