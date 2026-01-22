'use client';

import * as React from 'react';
import { Suspense, lazy } from 'react';
import { useGlobalStore } from '@/app/[locale]/store';

// Lazy load LoginModal only when needed
const LoginModal = lazy(() =>
  import('@/components/LoginModal').then((mod) => ({
    default: mod.LoginModal,
  })),
);

/**
 * Lazy-loaded LoginModal wrapper
 * Only loads the modal code when isLoginModalOpen becomes true
 * Optimizes initial bundle size and performance
 *
 * Performance Benefits:
 * - Reduces initial bundle by ~15KB
 * - Modal code loaded only on first open
 * - Subsequent opens use cached code
 */
export function LazyLoginModal() {
  const isLoginModalOpen = useGlobalStore((s) => s.isLoginModalOpen);

  // Don't render anything if modal is not open
  // This prevents loading the modal code until it's actually needed
  if (!isLoginModalOpen) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LoginModal />
    </Suspense>
  );
}
