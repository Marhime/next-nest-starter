'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

import LocaleSwitcher from '../LocaleSwitcher';
import ProfileDropdown from './ProfileDropdown';
import Link from 'next/link';
import { AddPropertyButton } from '../AddPropertyButton';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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
    <div
      className={cn(
        'sticky top-0 left-0 right-0 xl:py-6 z-20 mx-auto bg-white border-b',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between mx-auto',
          variant === 'home' ? 'container' : 'container-fluid',
        )}
      >
        {/* Logo */}
        <Link
          href={'/'}
          className="text-primary text-2xl font-bold shrink-0 flex items-center"
        >
          <Image
            src="/logo1.svg"
            alt="Home image showcase"
            width={170}
            height={30}
            priority
          />
        </Link>

        {/* Search Button - Conditional based on page */}

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
