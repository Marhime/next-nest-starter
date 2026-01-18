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
import { AddPropertyButton } from '../AddPropertyButton';
import { UserRound } from 'lucide-react';
import { Button } from '../ui/button';

const ProfileDropdown = () => {
  const { data: session, isPending: isLoading } = authClient.useSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const user = session?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'icon'} size={'icon'} className="">
          <UserRound color="#000000" />
        </Button>
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
              <DropdownMenuItem asChild>
                <AddPropertyButton variant="link" />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        <HelpButton />

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
