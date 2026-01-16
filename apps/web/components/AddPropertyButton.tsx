'use client';

import { Button } from '@/components/ui/button';
import { useGlobalStore } from '@/app/[locale]/store';
import { authClient } from '@/lib/auth/auth-client';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  size = 'lg',
  className,
  children,
}: AddPropertyButtonProps) {
  const setIsOpen = useGlobalStore((state) => state.setIsPropertyTypeModalOpen);
  const setIsLoginOpen = useGlobalStore((state) => state.setIsLoginModalOpen);
  const setIsQuickCreatePhoneOpen = useGlobalStore(
    (state) => state.setIsQuickCreatePhoneModalOpen,
  );
  const { data: session, isPending } = authClient.useSession();
  const t = useTranslations('AddPropertyButton');

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className, 'font-bold rounded-lg')}
      onClick={() => {
        // If user is not authenticated, open the login modal instead of starting creation
        if (!isPending && !session?.user) {
          // mark intent so we can resume creation after login
          const setPending = useGlobalStore.getState().setPendingCreateIntent;
          setPending?.(true);
          // Open quick-create phone modal when available
          if (setIsQuickCreatePhoneOpen) {
            setIsQuickCreatePhoneOpen(true);
            return;
          }
          // fallback: open login modal
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
