'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import {
  BadgeDollarSignIcon,
  CircleDollarSign,
  DollarSign,
  DollarSignIcon,
  MapPin,
  SearchIcon,
} from 'lucide-react';
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
        <div className="flex flex-col md:flex-row gap-4 p-4 shadow-md rounded-b-lg rounded-tr-lg bg-white">
          <div className="flex flex-1 items-center gap-2 relative">
            <Input type="text" placeholder="Search" />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">
              <SearchIcon className="block" />
            </span>
          </div>
          <div className="flex flex-1 items-center gap-2 relative">
            <Input type="text" placeholder="Location" />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">
              <MapPin className=":block" />
            </span>
          </div>
          <div className="flex flex-1 items-center gap-2 relative">
            <Input type="text" placeholder="Price" />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">
              <CircleDollarSign className="block" />
            </span>
          </div>
          <Link
            href={'/find'}
            className="px-6 py-1 glassy-effect bg-primary rounded-lg text-white"
          >
            {t('search')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchBarHome;
