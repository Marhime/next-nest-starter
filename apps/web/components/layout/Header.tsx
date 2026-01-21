'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { AddPropertyButton } from '../AddPropertyButton';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { HeaderSearchBar } from '../search/HeaderSearchBar';
import { TextAlignJustify } from 'lucide-react';
import LocaleSwitcher from '../LocaleSwitcher';
import ProfileDropdown from './ProfileDropdown';

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
        'sticky top-0 left-0 right-0 py-4 xl:py-6 z-99 mx-auto bg-white border-b',
      )}
    >
      <div
        className={cn(
          'flex justify-between items-center gap-2 md:gap-4 mx-auto w-full',
          variant === 'home' ? 'container' : 'container-fluid',
        )}
      >
        {/* Logo */}
        <div className="flex gap-2 md:gap-4 items-center">
          <TextAlignJustify size={28} className="relative text-primary" />
          <Link
            href={'/'}
            className="text-primary text-2xl font-bold shrink-0 flex items-center"
          >
            <Image
              src="/logo.svg"
              alt="Logo"
              width={34}
              height={34}
              priority
              className="block md:hidden"
            />
            <Image
              src="/logo1.svg"
              alt="Logo"
              width={170}
              height={30}
              priority
              className="hidden md:block"
            />
          </Link>
        </div>

        {/* Header Search Bar - Shows only on /find page */}
        <HeaderSearchBar />

        {/* Right Actions */}
        <div className="text-white flex gap-2 md:gap-4 justify-end items-center shrink-0">
          <AddPropertyButton
            className="rounded-full"
            variant={'default'}
            icon={true}
          />

          <LocaleSwitcher className="hidden md:block" />
          {/* <ProfileDropdown /> */}
        </div>
      </div>
    </div>
  );
};

export default Header;
