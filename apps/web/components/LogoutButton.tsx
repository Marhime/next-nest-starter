'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IconLogout } from '@tabler/icons-react';
import { authClient } from '@/lib/auth/auth-server';
import { VariantProps } from 'class-variance-authority';
import { DropdownMenuItem } from './ui/dropdown-menu';

type LogoutButtonProps = {
  variant?: VariantProps<typeof Button>['variant'] | 'dropdown';
  asChild?: boolean;
};

export function LogoutButton({ variant, asChild }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Sinon retourne un Button normal
  if (variant) {
    if (variant === 'dropdown') {
      return (
        <DropdownMenuItem
          onMouseOver={() => console.log('over')}
          onClick={handleLogout}
        >
          Log out
        </DropdownMenuItem>
      );
    } else {
      return (
        <Button onClick={handleLogout} variant={variant}>
          <IconLogout />
          Log out
        </Button>
      );
    }
  }

  return (
    <button onClick={handleLogout}>
      <IconLogout size={16} />
      Log out
    </button>
  );
}
