import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

const HeaderMenu = () => {
  const t = useTranslations('Navigation');
  return (
    <div className="glassy-effect p-3 rounded-full">
      <ul className="flex gap-4 text-white">
        <li>
          <Link
            className="px-4 py-1 rounded-full cursor-pointer font-semibold bg-white text-black"
            href="/"
          >
            {t('home')}
          </Link>
        </li>
        <li>
          <Link className="px-4 py-1 rounded-lg cursor-pointer" href="/about">
            {t('about')}
          </Link>
        </li>
        <li>
          <Link
            className="px-4 py-1 rounded-lg cursor-pointer"
            href="/services"
          >
            {t('services')}
          </Link>
        </li>
        <li>
          <Link className="px-4 py-1 rounded-lg cursor-pointer" href="/contact">
            {t('contact')}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default HeaderMenu;
