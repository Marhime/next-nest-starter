'use client';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { LogoutButton } from '../LogoutButton';
import { HelpButton } from '../ui/HelpButton';
import { authClient } from '@/lib/auth/auth-client';

const ProfileDropdown = () => {
  const { data: session, isPending: isLoading } = authClient.useSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const user = session?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <Avatar>
            <AvatarImage src={user?.image || ''} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={12}>
        {user?.role === 'ADMIN' && (
          <>
            <DropdownMenuLabel>Admin</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
          </>
        )}
        {user && (
          <>
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/">Profile</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        <HelpButton />
        <DropdownMenuSeparator />
        <DropdownMenuItem>Lorem</DropdownMenuItem>
        <DropdownMenuItem>Ladentium</DropdownMenuItem>
        <DropdownMenuItem>Oficina</DropdownMenuItem>
        <DropdownMenuSeparator />

        {user ? (
          <>
            <LogoutButton variant="dropdown" />
          </>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/auth/login">Se connecter</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
