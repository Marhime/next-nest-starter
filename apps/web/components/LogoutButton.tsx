'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Se déconnecter
    </Button>
  );
}
