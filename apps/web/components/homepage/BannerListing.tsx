import React from 'react';

const BannerListing = () => {
  return (
    <div className="p-6 bg-primary rounded-lg flex flex-col gap-4 items-center text-center mt-12 mx-auto max-w-4xl">
      <p className="text-white text-2xl font-semibold">
        C'est le moment de vendre !
      </p>
      <button className="font-semibold mt-2 bg-white text-primary px-4 py-2 rounded-lg">
        Publier votre annonce
      </button>
    </div>
  );
};

export default BannerListing;
