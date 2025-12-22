'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGlobalStore } from '@/app/[locale]/store';
import { LoginForm } from '@/app/[locale]/auth/login/login-form';
import { SignupForm } from '@/app/[locale]/auth/register/signup-form';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function LoginModal() {
  const isOpen = useGlobalStore((s) => s.isLoginModalOpen);
  const setIsOpen = useGlobalStore((s) => s.setIsLoginModalOpen);
  const [showRegister, setShowRegister] = useState(false);
  const t = useTranslations('LoginModal');

  return (
    <Dialog open={!!isOpen} onOpenChange={(open) => setIsOpen?.(open)}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {showRegister ? t('registerTitle') : t('loginTitle')}
          </DialogTitle>
        </DialogHeader>
        <div className="pt-2">
          {showRegister ? <SignupForm /> : <LoginForm />}
        </div>
        <div className="px-6 pb-6 text-center">
          {showRegister ? (
            <button
              type="button"
              className="text-sm text-primary underline-offset-4 hover:underline"
              onClick={() => setShowRegister(false)}
            >
              {t('haveAccount')}
            </button>
          ) : (
            <button
              type="button"
              className="text-sm text-primary underline-offset-4 hover:underline"
              onClick={() => setShowRegister(true)}
            >
              {t('noAccount')}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
