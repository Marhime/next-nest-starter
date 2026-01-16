import React from 'react';
import Link from 'next/link';

const RecentProperties = () => {
  return (
    <section className="">
      <h2 className="text-xl font-semibold">Décourvrez nos propriétés</h2>
      <div className="flex justify-between items-end">
        <p className="text-muted-foreground mt-4">
          Parcourez les dernières propriétés ajoutées à notre plateforme.
        </p>
        <Link
          href="/find"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm"
        >
          Voir toutes les propriétés
        </Link>
      </div>
    </section>
  );
};

export default RecentProperties;
