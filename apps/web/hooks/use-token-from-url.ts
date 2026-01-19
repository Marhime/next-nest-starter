'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAddPropertyStore } from '@/app/[locale]/hosting/store';
import { toast } from 'sonner';

/**
 * Hook to extract editToken from URL query params and save to sessionStorage
 * Usage: Call in any page that needs to handle ?token=xxx URLs
 *
 * Example: /hosting/63?token=abc123 → saves token to sessionStorage and removes from URL
 */
export function useTokenFromUrl(propertyId?: number | string | string[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { setEditToken } = useAddPropertyStore.getState();
  const [pendingToken, setPendingToken] = useState<{
    token: string;
    propertyId: string;
  } | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const accept = searchParams.get('accept'); // Check if user accepted

    if (token && propertyId) {
      // Handle both string and array (Next.js dynamic routes)
      const id = Array.isArray(propertyId) ? propertyId[0] : propertyId;

      // If accept=true, save the token immediately
      if (accept === 'true') {
        setEditToken(parseInt(id.toString()), token);

        console.log('✅ Token extracted from URL and saved to sessionStorage', {
          propertyId: id,
        });
        toast.success("Token d'édition restauré avec succès");

        // Remove token and accept param from URL for security
        router.replace(pathname);
      } else {
        // Store pending token for confirmation
        setPendingToken({ token, propertyId: id.toString() });
      }
    }
  }, [searchParams, propertyId, pathname, router, setEditToken]);

  return {
    pendingToken,
    acceptToken: () => {
      if (pendingToken) {
        setEditToken(parseInt(pendingToken.propertyId), pendingToken.token);
        toast.success("Token d'édition restauré avec succès");
        router.replace(pathname);
        setPendingToken(null);
      }
    },
    rejectToken: () => {
      router.replace(pathname);
      setPendingToken(null);
      toast.info('Token refusé');
    },
  };
}
