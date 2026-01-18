import React from 'react';
import SearchBarHome from '../layout/SearchBarHome';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const Hero = () => {
  const t = useTranslations('Home');
  return (
    <div className="relative flex items-end min-h-[50svh] mb-12">
      <div className="overlay"></div>
      <Image
        src="/home-03.png"
        alt="Home image showcase"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover object-center z-10 "
        priority
      />
      <div className="relative z-20 container w-full">
        <div className="text-center space-y-4 translate-y-12">
          <h1 className="text-white text-3xl lg:text-7xl font-semibold max-w-[18ch] mx-auto">
            {t('title')}
          </h1>
          <p className="text-white text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="flex justify-center max-w-5xl mx-auto">
            <SearchBarHome />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
