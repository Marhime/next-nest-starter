/**
 * Property Sidebar Component
 * Resizable sidebar with property list (filters managed by unified store)
 * On mobile: Drawer that overlays the map
 * On desktop: Resizable sidebar
 * Features pagination for the property list
 */

'use client';

import { PropertyCard } from './PropertyCard';
import { useSearchStore, type Property } from '@/stores/search-store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Home, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { usePropertyData } from '@/hooks/use-property-data';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';

export function PropertyResultList() {
  const {
    properties,
    isFetching,
    error,
    currentPage,
    setCurrentPage,
    setSidebarWidth,
    isMobileDrawerOpen,
    setMobileDrawerOpen,
  } = useSearchStore();

  // Fetch properties data
  usePropertyData();

  const isDesktop = useMediaQuery('(min-width: 990px)');
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isError = error !== null;

  // Client-side pagination (20 items per page) - Memoized for performance
  const ITEMS_PER_PAGE = 20;

  const paginationData = useMemo(() => {
    const allProperties = properties || [];
    const totalResults = allProperties.length;
    const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedProperties = allProperties.slice(startIndex, endIndex);

    return { totalResults, totalPages, paginatedProperties };
  }, [properties, currentPage]);

  const { totalResults, totalPages, paginatedProperties } = paginationData;

  // Handle page change with scroll to top
  const handlePageChange = (newPage: number) => {
    // Scroll to top of the page
    if (typeof window !== 'undefined' && isDesktop) {
      window.scrollTo({ top: 0 });
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0 });
    }

    // Update page in store
    setCurrentPage(newPage);

    // The URL will be updated automatically by the layout's useEffect
    // No need to manually update here to avoid conflicts
  };

  // Note: Page reset is now handled in the store actions when filters change
  // This avoids resetting the page when loading from URL with a specific page number

  // Scroll to top when properties change (refetch after filter/map change)
  // Skip initial mount to avoid scrolling on page load
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    // Skip on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    // Only scroll if fetching (loading new data)
    if (isFetching) {
      // Scroll to top of the list container
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0 });
      }
      // Also scroll window on desktop
      if (typeof window !== 'undefined' && isDesktop) {
        window.scrollTo({ top: 0 });
      }
    }
  }, [isFetching, isDesktop]);

  // Handle resize for desktop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;

      const containerWidth = window.innerWidth;
      const newWidth = (e.clientX / containerWidth) * 100;

      setSidebarWidth(Math.max(30, Math.min(80, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, setSidebarWidth]);

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  // Mobile: Drawer with swipe-to-dismiss (no overlay)
  if (!isDesktop) {
    return (
      <Drawer
        open={isMobileDrawerOpen}
        onOpenChange={setMobileDrawerOpen}
        dismissible={true}
        modal={false}
      >
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Recherche de propriétés</DrawerTitle>
            <div className="flex items-center gap-2 pt-2">
              {isFetching && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </DrawerHeader>

          <PropertyListContent
            isFetching={isFetching}
            isError={isError}
            error={error}
            filteredProperties={paginatedProperties}
            className="px-4 pt-2 max-md:overflow-y-auto"
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={totalResults}
            onPageChange={handlePageChange}
            scrollContainerRef={scrollContainerRef}
          />

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Fermer</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Resizable sidebar
  return (
    <div
      ref={sidebarRef}
      className={cn(
        'w-3/5 max-w-[800px] relative flex flex-col bg-white border-l transition-all',
      )}
    >
      {/* Property List */}
      <div className="flex-1">
        <PropertyListContent
          isFetching={isFetching}
          isError={isError}
          error={error}
          filteredProperties={paginatedProperties}
          className={cn('p-4 xl:p-12 md:py-8 ')}
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={totalResults}
          onPageChange={handlePageChange}
          scrollContainerRef={scrollContainerRef}
        />
      </div>
    </div>
  );
}

// Separated content component for reusability
interface PropertyListContentProps {
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  filteredProperties: Property[];
  className?: string;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

function PropertyListContent({
  isFetching,
  isError,
  error,
  filteredProperties,
  className,
  currentPage,
  totalPages,
  totalResults,
  onPageChange,
  scrollContainerRef,
}: PropertyListContentProps) {
  const showProperties =
    !isFetching &&
    !isError &&
    filteredProperties &&
    filteredProperties.length > 0;
  return (
    <div ref={scrollContainerRef} className={cn(' h-full', className)}>
      {/* Loading State */}
      {isFetching && (
        <>
          <Skeleton className="h-4 w-48 mb-4 font-semibold" />
          <div
            className="grid gap-4 md:gap-y-10 md:gap-x-6 auto-rows-max"
            style={{
              gridTemplateColumns:
                'repeat(auto-fill, minmax(min(50%, 300px), 1fr))',
            }}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3 w-full max-w-[480px] mx-auto ">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Error State */}
      {!isFetching && isError && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Home className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Une erreur est survenue'}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isFetching && !isError && filteredProperties?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Home className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Aucune propriété trouvée</h3>
          <p className="text-sm text-muted-foreground">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}

      {/* Properties List */}
      {showProperties && (
        <>
          <p className="text-sm mb-4">
            {totalResults} propriété{totalResults !== 1 ? 's' : ''} trouvée
            {totalResults !== 1 ? 's' : ''} dans la zone de la carte
          </p>
          <div
            className="grid gap-4 md:gap-y-10 md:gap-x-6"
            style={{
              gridTemplateColumns:
                'repeat(var(--grid-columns-breakpoints), minmax(0, 1fr))',
            }}
          >
            {filteredProperties.map((property: Property, index) => (
              <div
                key={property.id}
                className="animate-in fade-in-0 slide-in-from-bottom-10"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationDuration: '400ms',
                  animationFillMode: 'backwards',
                }}
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          onPageChange(currentPage - 1);
                        }
                      }}
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                    />
                  </PaginationItem>

                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            onPageChange(1);
                          }}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {currentPage > 4 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {/* Pages around current page */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === currentPage ||
                        page === currentPage - 1 ||
                        page === currentPage - 2 ||
                        page === currentPage + 1 ||
                        page === currentPage + 2,
                    )
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            onPageChange(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            onPageChange(totalPages);
                          }}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          onPageChange(currentPage + 1);
                        }
                      }}
                      className={
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
