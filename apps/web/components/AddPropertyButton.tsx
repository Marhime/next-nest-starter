'use client';

import { Button } from '@/components/ui/button';
import { useGlobalStore } from '@/app/[locale]/store';
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
  const t = useTranslations('AddPropertyButton');

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => setIsOpen?.(true)}
    >
      <Plus className="h-4 w-4 mr-2" />
      {children || t('label')}
    </Button>
  );
}
