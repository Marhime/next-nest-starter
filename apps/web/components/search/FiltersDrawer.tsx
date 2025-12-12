'use client';

import React from 'react';
import useFiltersStore from '@/stores/filters-store';

export function FiltersDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const filters = useFiltersStore();

  const apply = () => {
    // In a real implementation we'd validate and close
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'} `}
      aria-hidden={!open}
    >
      <div
        className={`bg-white shadow-lg w-full max-w-md h-full ${open ? '' : 'hidden'}`}
      >
        <div className="p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filtres</h3>
          <button onClick={onClose}>Fermer</button>
        </div>

        <div className="p-4">
          <label className="block">City</label>
          <input
            className="w-full border p-2"
            value={filters.city || ''}
            onChange={(e) => filters.setFilters({ city: e.target.value })}
          />

          <label className="block mt-2">Min price</label>
          <input
            className="w-full border p-2"
            type="number"
            value={filters.minPrice ?? ''}
            onChange={(e) =>
              filters.setFilters({
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />

          <div className="mt-4">
            <button className="btn btn-primary" onClick={apply}>
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FiltersDrawer;
