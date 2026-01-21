'use client';
import { LoginForm } from './login-form';
import { Link, redirect } from '@/i18n/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { useLocale } from 'next-intl';
import Image from 'next/image';

export default function LoginPage({}: {}) {
  const { data: session, isPending: isLoading } = authClient.useSession();
  const locale = useLocale();

  if (session?.user) {
    if (session?.user.role === 'ADMIN') {
      redirect({ href: { pathname: '/dashboard' }, locale });
    } else {
      redirect({ href: { pathname: '/' }, locale });
    }
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image
            src="/logo1.svg"
            alt="Home image showcase"
            width={170}
            height={30}
            priority
          />
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
