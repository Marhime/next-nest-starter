import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { JSX } from 'react';

/**
 * Fonction utilitaire pour récupérer la session depuis le backend
 * Utilisation dans une Server Component, Server Action ou API Route
 */
export async function getServerSession() {
  const headersList = await headers();
  const cookie = headersList.get('cookie') || '';

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/get-session`,
      {
        headers: {
          Cookie: cookie,
        },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.session ? data : null;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

/**
 * Higher-Order Function pour protéger une page
 * Utilisation :
 *
 * export default withAuth(async ({ session }) => {
 *   return <div>Hello {session.user.name}</div>
 * })
 */
export function withAuth<T extends Record<string, unknown>>(
  Component: (
    props: T & {
      session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>;
    },
  ) => Promise<JSX.Element>,
) {
  return async (props: T) => {
    const session = await getServerSession();

    if (!session) {
      redirect('/auth/login');
    }

    return Component({ ...props, session });
  };
}

/**
 * Fonction pour exiger une authentification
 * Lance une erreur si l'utilisateur n'est pas connecté
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}
