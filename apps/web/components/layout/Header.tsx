'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { SearchFiltersButton } from '../search/SearchFiltersButton';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

import { ArrowLeft, ArrowLeftIcon, SlidersHorizontal } from 'lucide-react';
import LocaleSwitcher from '../LocaleSwitcher';
import ProfileDropdown from './ProfileDropdown';
import Link from 'next/link';
import { AddPropertyButton } from '../AddPropertyButton';

const Header = () => {
  const pathname = usePathname();
  const locale = useLocale();

  const variant = useMemo(() => {
    const pathWithoutLocale = pathname.startsWith(`/${locale}`)
      ? pathname.slice(0, -locale.length)
      : pathname;

    const isHomepage = pathWithoutLocale === '/';
    const isFindPage = pathname?.includes('/find');

    console.log(isHomepage, isFindPage);
    if (isHomepage) return 'home';
    if (isFindPage) return 'find';
  }, [pathname, locale]);

  return (
    <div className="fixed top-0 left-0 right-0 p-4 xl:py-6 xl:px-12 z-20 max-w-[1824px] mx-auto">
      <div className="flex justify-between">
        {/* Logo */}
        <Link href={'/'} className="text-primary text-2xl font-bold shrink-0">
          MyLogo
        </Link>

        {/* Search Button - Conditional based on page */}
        {/* <ModernSearchBar /> */}
        {variant === 'find' && (
          <div className="flex-1">
            <ArrowLeft />
          </div>
        )}

        {/* <SearchFiltersButton variant={variant} className="bg-white" />
        {variant === 'find' && (
          <div className="flex-1 flex justify-end">
            <SlidersHorizontal />
          </div>
        )} */}

        {/* Right Actions */}
        <div className="text-white flex justify-end items-center gap-4 shrink-0">
          <AddPropertyButton className="rounded-full" variant="default" />
          <LocaleSwitcher className="hidden md:block" />
          <ProfileDropdown />
        </div>
      </div>
    </div>
  );
};

export default Header;
