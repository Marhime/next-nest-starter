/**
 * Mobile Search Bar for /find Page
 * Fixed at top of map on mobile, shows filters button
 */

'use client';

import { SearchFiltersButton } from '../search/SearchFiltersButton';

export function MobileSearchBar() {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-10 p-3 bg-gradient-to-b from-white via-white to-transparent">
      <SearchFiltersButton variant="compact" />
    </div>
  );
}
