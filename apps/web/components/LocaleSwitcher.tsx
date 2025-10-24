'use client';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Locale, useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { routing } from '@/i18n/routing';
import Image from 'next/image';

const LocaleSwitcher = () => {
  const t = useTranslations('LocaleLayout');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const onSelectChange = (nextLocale: string) => {
    console.log('Switching locale to:', { nextLocale, pathname, params });
    router.replace(
      // @ts-expect-error -- TypeScript will validate that only known `params`
      // are used in combination with a given `pathname`. Since the two will
      // always match for the current route, we can skip runtime checks.
      { pathname, params },
      { locale: nextLocale as Locale },
    );
  };

  return (
    <Select defaultValue={locale} onValueChange={onSelectChange}>
      <SelectTrigger className="bg-white text-black">
        <SelectValue>
          <Image
            src={`/${locale}.svg`}
            alt={t(`locales.${locale}`)}
            width={24}
            height={24}
          />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {routing.locales.map((loc) => (
            <SelectItem key={loc} value={loc}>
              <Image
                src={`/${loc}.svg`}
                alt={t(`locales.${loc}`)}
                width={24}
                height={24}
              />
              {t(`locales.${loc}`)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default LocaleSwitcher;
