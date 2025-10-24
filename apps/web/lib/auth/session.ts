import { headers } from 'next/headers';

async function getAuthSession() {
  const headersList = await headers();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/get-session`,
    {
      headers: {
        cookie: headersList.get('cookie') || '',
      },
      credentials: 'include',
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getSession() {
  try {
    const data = await getAuthSession();
    return data;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return session;
}
