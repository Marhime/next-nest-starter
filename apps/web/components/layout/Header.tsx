'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import ProfileDropdown from './ProfileDropdown';
import LocaleSwitcher from '../LocaleSwitcher';
import { Link } from '@/i18n/navigation';
import SearchBarDesktop from '../search/SearchBarDesktop';
import { SearchBarFind } from '../search/SearchBarFind';

const Header = () => {
  const pathname = usePathname();
  const isFindPage = pathname?.includes('/find');

  return (
    <div className="fixed top-0 left-0 right-0 p-4 xl:py-6 xl:px-12 z-20 max-w-[1824px] mx-auto">
      <div className="flex items-center gap-4 w-full">
        {/* Logo */}
        <Link href={'/'} className="text-white text-2xl font-bold shrink-0">
          MyLogo
        </Link>

        {/* Search Bar - Conditional based on page */}
        <div className="hidden md:flex flex-1 justify-center items-center px-4">
          {isFindPage ? <SearchBarFind /> : <SearchBarDesktop />}
        </div>

        {/* Right Actions */}
        <div className="text-white flex justify-end items-center gap-4 shrink-0">
          <LocaleSwitcher className="hidden md:block" />
          <ProfileDropdown />
        </div>
      </div>
    </div>
  );
};

export default Header;
