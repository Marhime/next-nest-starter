'use client';

import { Button } from '@/components/ui/button';
import { useGlobalStore } from '@/app/[locale]/store';
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
  const t = useTranslations('AddPropertyButton');

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className, 'font-bold rounded-lg')}
      onClick={() => setIsOpen?.(true)}
    >
      <Plus className="size-5" />
      {children || t('label')}
    </Button>
  );
}
