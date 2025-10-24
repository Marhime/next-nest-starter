'use client';
import { GalleryVerticalEnd } from 'lucide-react';
import { LoginForm } from './login-form';
import { redirect } from '@/i18n/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { useLocale } from 'next-intl';

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
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
