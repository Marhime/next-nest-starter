'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { DollarSign, MapPin, SearchIcon } from 'lucide-react';
import Link from 'next/link';

const SearchBarHome = () => {
  const t = useTranslations('Home');

  const [mode, setMode] = useState<'rent' | 'buy'>('rent');

  return (
    <div className="flex flex-col w-full">
      <div className="flex">
        <button
          className={cn(
            'py-3 px-6 rounded-t-lg',
            mode === 'rent' ? 'bg-white ' : 'text-white glassy-effect',
          )}
          onClick={() => setMode('rent')}
        >
          Rent
        </button>
        <button
          className={cn(
            'py-3 px-6 rounded-t-lg',
            mode === 'buy'
              ? 'bg-white rounded-tl-lg'
              : ' text-white glassy-effect',
          )}
          onClick={() => setMode('buy')}
        >
          Buy
        </button>
      </div>
      <div className="">
        {/* <InputGroup className="bg-white text-black p-4 xl:py-8">
          <InputGroupInput placeholder={t('searchPlaceholder')} />
          <InputGroupAddon align="inline-end">
            <Button className="rounded-full px-6 py-4">{t('search')}</Button>
          </InputGroupAddon>
        </InputGroup> */}
        <div className="flex gap-4 p-4 shadow-md rounded-b-lg rounded-tr-lg bg-white">
          <div className="flex flex-1 items-center gap-2">
            <SearchIcon className="" />
            <Input type="text" placeholder="Search" />
          </div>
          <div className="flex flex-1 items-center gap-2">
            <MapPin className="" />
            <Input type="text" placeholder="Location" />
          </div>
          <div className="flex flex-1 items-center gap-2">
            <DollarSign className="" />
            <Input type="text" placeholder="Price" />
          </div>
          <Link href={'/find'} className="px-6 py-4 glassy-effect">
            {t('search')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchBarHome;
