'use client';

import { useGlobalStore } from '@/app/[locale]/store';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { IconHelpCircle } from '@tabler/icons-react';
import React from 'react';
export function HelpButton() {
  const setIsOpen = useGlobalStore((state) => state.setIsOpen);
  return (
    <DropdownMenuItem onClick={() => setIsOpen?.(true)}>
      <IconHelpCircle size={16} />
      Help & Support
    </DropdownMenuItem>
  );
}
