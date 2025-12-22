'use client';

import { Button } from '@/components/ui/button';
import { useGlobalStore } from '@/app/[locale]/store';
import { authClient } from '@/lib/auth/auth-client';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';

interface AddPropertyButtonProps {
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function AddPropertyButton({
  variant = 'default',
  size = 'default',
  className,
  children,
}: AddPropertyButtonProps) {
  const setIsOpen = useGlobalStore((state) => state.setIsPropertyTypeModalOpen);
  const setIsLoginOpen = useGlobalStore((state) => state.setIsLoginModalOpen);
  const { data: session, isPending } = authClient.useSession();
  const t = useTranslations('AddPropertyButton');

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => {
        // If user is not authenticated, open the login modal instead of starting creation
        if (!isPending && !session?.user) {
          // mark intent so we can resume creation after login
          const setPending = useGlobalStore.getState().setPendingCreateIntent;
          setPending?.(true);
          setIsLoginOpen?.(true);
          return;
        }
        setIsOpen?.(true);
      }}
    >
      <Plus className="size-5" />
      {children || t('label')}
    </Button>
  );
}
