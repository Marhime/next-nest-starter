import { ModernSearchBar } from '@/components/search/ModernSearchBar';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Home() {
  const t = useTranslations('Home');
  return (
    <main className="flex-1 ">
      <div className="relative flex items-end min-h-[65svh]">
        <div className="overlay"></div>
        <Image
          src="/home-01.jpg"
          alt="Home image showcase"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover z-10"
          priority
        />
        <div className="relative p-4 md:pb-8 xl:px-12 z-20 max-w-[1824px]">
          <div className="flex flex-col gap-4 md:grid md:grid-cols-12 md:gap-8">
            <h1 className="text-white text-3xl md:text-6xl pr-12 md:pr-20 font-semibold md:col-span-7 lg:col-span-6 ">
              {t('title')}
            </h1>
            <ModernSearchBar className="md:order-2 md:col-span-12" />
            <p className="text-white md:block md:text-lg md:col-start-8 md:col-span-5 self-end">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
