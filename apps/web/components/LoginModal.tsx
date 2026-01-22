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
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FieldDescription } from './ui/field';
import { Link } from 'lucide-react';

export function LoginModal() {
  const isOpen = useGlobalStore((s) => s.isLoginModalOpen);
  const setIsOpen = useGlobalStore((s) => s.setIsLoginModalOpen);
  const pendingAction = useGlobalStore((s) => s.pendingAction);
  const [showRegister, setShowRegister] = useState(false);
  const t = useTranslations('LoginModal');
  const tForm = useTranslations('LoginForm');

  // Set initial mode based on pending action preference
  useEffect(() => {
    if (isOpen && pendingAction?.preferredMode) {
      setShowRegister(pendingAction.preferredMode === 'register');
    }
  }, [isOpen, pendingAction]);

  return (
    <Dialog open={!!isOpen} onOpenChange={(open) => setIsOpen?.(open)}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {showRegister ? t('registerTitle') : t('loginTitle')}
          </DialogTitle>
        </DialogHeader>
        <div className="pt-2">
          {showRegister ? (
            <SignupForm className="border-none shadow-none" />
          ) : (
            <LoginForm className="border-none shadow-none" />
          )}
        </div>
        <div className="px-6 pb-6 text-center">
          {showRegister ? (
            <div className="flex flex-col gap-10 justify-center">
              <div className="flex items-center text-sm text-center justify-center gap-1">
                {tForm('alreadyHaveAccount')}{' '}
                <button
                  onClick={() => setShowRegister(false)}
                  className="text-primary underline-offset-4 hover:underline font-medium"
                >
                  {tForm('connectHere')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-10 justify-center">
              <div className="flex items-center text-sm text-center justify-center gap-1">
                {tForm('signup')}{' '}
                <button
                  onClick={() => setShowRegister(true)}
                  className="text-primary underline-offset-4 hover:underline font-medium"
                >
                  {tForm('signupLinkText')}
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
