/**
 * Property Sidebar Component
 * Resizable sidebar with property list (filters managed by unified store)
 * On mobile: Drawer that overlays the map
 * On desktop: Resizable sidebar
 */

'use client';

import { PropertyCard } from './PropertyCard';
import { useSearchStore, type Property } from '@/stores/search-store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Home, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';

export function PropertySidebar() {
  const {
    properties,
    isFetching,
    error,
    sidebarWidth,
    setSidebarWidth,
    isSidebarCollapsed,
    isMobileDrawerOpen,
    setMobileDrawerOpen,
  } = useSearchStore();

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isError = error !== null;
  const filteredProperties = properties || [];

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
              {filteredProperties && (
                <p className="text-sm text-muted-foreground">
                  {filteredProperties.length} propriété
                  {filteredProperties.length !== 1 ? 's' : ''} trouvée
                  {filteredProperties.length !== 1 ? 's' : ''}
                </p>
              )}
              {isFetching && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </DrawerHeader>

          <PropertyListContent
            isFetching={isFetching}
            isError={isError}
            error={error}
            filteredProperties={filteredProperties}
            className="px-4 overflow-y-auto"
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
        'hidden md:flex md:absolute md:left-0 md:top-0 md:bottom-0 z-10',
        'relative bg-background border-r transition-all duration-300 flex-col',
        isSidebarCollapsed && 'md:w-16',
      )}
      style={
        {
          width: isSidebarCollapsed ? '4rem' : `${sidebarWidth}%`,
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h1
            className={cn(
              'text-xl font-bold transition-opacity',
              isSidebarCollapsed && 'opacity-0',
            )}
          >
            Recherche de propriétés
          </h1>
        </div>

        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2">
            {filteredProperties && (
              <p className="text-sm text-muted-foreground">
                {filteredProperties.length} propriété
                {filteredProperties.length !== 1 ? 's' : ''} trouvée
                {filteredProperties.length !== 1 ? 's' : ''}
              </p>
            )}
            {isFetching && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      {/* Property List */}
      <div className="flex-1 overflow-hidden">
        <PropertyListContent
          isFetching={isFetching}
          isError={isError}
          error={error}
          filteredProperties={filteredProperties}
          className={cn('p-4 pb-8', isSidebarCollapsed && 'hidden')}
        />
      </div>

      {/* Resize Handle */}
      {!isSidebarCollapsed && (
        <div
          className={cn(
            'absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:bg-primary transition-colors',
            isResizing && 'bg-primary',
          )}
          onMouseDown={handleResizeStart}
        >
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-3 h-12 bg-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
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
}

function PropertyListContent({
  isFetching,
  isError,
  error,
  filteredProperties,
  className,
}: PropertyListContentProps) {
  return (
    <div className={cn('overflow-y-auto h-full', className)}>
      {/* Loading State */}
      {isFetching && (
        <div
          className="grid gap-4 auto-rows-max"
          style={{
            gridTemplateColumns:
              'repeat(auto-fill, minmax(min(50%, 300px), 1fr))',
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3 w-full max-w-[480px] mx-auto">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
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
      {!isFetching &&
        !isError &&
        filteredProperties &&
        filteredProperties.length > 0 && (
          <div
            className="grid gap-4 auto-rows-max animate-in fade-in-0 duration-500"
            style={{
              gridTemplateColumns:
                'repeat(auto-fill, minmax(min(50%, 300px), 1fr))',
            }}
          >
            {filteredProperties.map((property: Property, index) => (
              <div
                key={property.id}
                className="animate-in fade-in-0 slide-in-from-bottom-4"
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
        )}
    </div>
  );
}
