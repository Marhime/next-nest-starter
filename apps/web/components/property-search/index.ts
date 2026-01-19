/**
 * Property Search Components
 * Central export file for all property search components
 *
 * Note: PropertyMap is NOT exported here to avoid SSR issues with Leaflet.
 * Import it directly with dynamic import where needed:
 * const PropertyMap = dynamic(() => import('./PropertyMap').then(m => ({ default: m.PropertyMap })), { ssr: false });
 */

// export { PropertyMap } from './PropertyMap'; // ❌ Removed - causes SSR errors
export { PropertyResultList } from './PropertyResultList';
export { PropertyCard } from './PropertyCard';
export { PropertyFilters } from './PropertyFilters';
