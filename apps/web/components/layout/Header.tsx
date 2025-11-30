import React from 'react';
import HeaderMenu from './HeaderMenu';
import ProfileDropdown from './ProfileDropdown';
import LocaleSwitcher from '../LocaleSwitcher';
import { Link } from '@/i18n/navigation';

const Header = () => {
  return (
    <div className="fixed top-0 left-0 right-0 p-4 xl:py-6 xl:px-12 z-20 max-w-[1824px] mx-auto">
      <div className="grid grid-cols-12 items-center">
        <Link
          href={'/'}
          className="text-white text-2xl font-bold col-span-6 md:col-span-2"
        >
          MyLogo
        </Link>
        <div className=" justify-center items-center col-span-8 md:flex hidden">
          <HeaderMenu />
        </div>
        <div className="text-white flex justify-end col-span-6 md:col-span-2 items-center gap-4">
          <LocaleSwitcher className="hidden md:block" />
          <ProfileDropdown />
        </div>
      </div>
    </div>
  );
};

export default Header;
