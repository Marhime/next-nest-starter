import React from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group';
import { Button } from './ui/button';
import { useTranslations } from 'next-intl';

const SearchBarHome = () => {
  const t = useTranslations('Home');
  return (
    <InputGroup className="bg-white text-black p-4 xl:py-8 rounded">
      <InputGroupInput placeholder={t('searchPlaceholder')} />
      <InputGroupAddon align="inline-end">
        <Button className="rounded-full px-6 py-4">{t('search')}</Button>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default SearchBarHome;
