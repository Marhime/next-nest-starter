import { ModernSearchBar } from '@/components/search/ModernSearchBar';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Home() {
  const t = useTranslations('Home');
  return (
    <main className="flex-1 ">
      <div className="relative flex items-end min-h-[85svh]">
        <div className="overlay"></div>
        <Image
          src="/home-01.jpg"
          alt="Home image showcase"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover z-10"
          priority
        />
        <div className="relative text-white p-4 xl:py-10 xl:px-12 z-20 max-w-[1824px] mx-auto ">
          <div className="col-span-12 lg:col-span-8">
            <h1 className="text-8xl pr-20 font-semibold">{t('title')}</h1>
          </div>
          <div className="">
            <ModernSearchBar />
            {/* <p className="text-lg">{t('subtitle')}</p> */}
          </div>
        </div>
      </div>
    </main>
  );
}
