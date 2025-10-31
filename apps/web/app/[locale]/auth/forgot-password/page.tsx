'use client';
import { GalleryVerticalEnd } from 'lucide-react';
import { Link, redirect } from '@/i18n/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { useLocale } from 'next-intl';
import PasswordChangeForm from './password-change-form';
import { useSearchParams } from 'next/navigation';
import RequestEmailForm from './request-email-form';

export default function LoginPage({}: {}) {
  const token = useSearchParams().get('token');

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </Link>
        {token ? <PasswordChangeForm /> : <RequestEmailForm />}
      </div>
    </div>
  );
}
