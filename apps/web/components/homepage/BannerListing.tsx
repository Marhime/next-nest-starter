import Image from 'next/image';
import React from 'react';

const BannerListing = () => {
  return (
    <div className="container">
      <div className="p-6 bg-primary rounded-2xl flex flex-col gap-4 items-center text-center h-[600px] mt-12 mx-auto relative overflow-hidden">
        <p className="text-white text-2xl font-semibold">
          C'est le moment de vendre !
        </p>
        <button className="font-semibold mt-2 bg-white text-primary px-4 py-2 rounded-lg">
          Publier votre annonce
        </button>
        <div className="overlay"></div>
        <Image
          src="/home-03.png"
          alt="Home image showcase"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover z-10"
          priority
        />
      </div>
    </div>
  );
};

export default BannerListing;
