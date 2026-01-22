'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useSavedSearches,
  useApplySavedSearch,
  useDeleteSavedSearch,
  type SavedSearch,
} from '@/hooks/use-saved-searches';
import { toast } from 'sonner';

// Simple time ago formatter
function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'il y a quelques secondes';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  }
  const months = Math.floor(diffInSeconds / 2592000);
  return `il y a ${months} mois`;
}

interface SavedSearchesListProps {
  variant?: 'dropdown' | 'sidebar';
  onApply?: () => void;
}

export function SavedSearchesList({
  variant = 'dropdown',
  onApply,
}: SavedSearchesListProps) {
  const router = useRouter();
  const { data: savedSearches, isLoading } = useSavedSearches();
  const { applySearch } = useApplySavedSearch();
  const { deleteSearch } = useDeleteSavedSearch();

  const handleApply = (search: SavedSearch) => {
    applySearch(search);
    toast.success(`Filtres de "${search.name}" appliqués`);

    // Navigate to /find if not already there
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/find')) {
      router.push('/find');
    }

    onApply?.();
  };

  const handleDelete = (id: number, name: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (confirm(`Supprimer la recherche "${name}" ?`)) {
      deleteSearch(id, {
        onSuccess: () => {
          toast.success(`"${name}" a été supprimée`);
        },
        onError: () => {
          toast.error('Impossible de supprimer cette recherche');
        },
      });
    }
  };

  const formatFilters = (filters: SavedSearch['filters']) => {
    const parts: string[] = [];

    if (filters.listingType) {
      parts.push(filters.listingType === 'SALE' ? 'Achat' : 'Location');
    }
    if (filters.location) {
      parts.push(filters.location);
    }
    if (filters.minPrice || filters.maxPrice) {
      const price = [
        filters.minPrice ? `${filters.minPrice}€` : '',
        filters.maxPrice ? `${filters.maxPrice}€` : '',
      ]
        .filter(Boolean)
        .join(' - ');
      if (price) parts.push(price);
    }
    if (filters.propertyType) {
      parts.push(filters.propertyType);
    }
    if (filters.minBedrooms) {
      parts.push(`${filters.minBedrooms}+ ch.`);
    }

    return parts.join(' • ');
  };

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Bookmark className="w-4 h-4 mr-2" />
            Mes recherches
            {savedSearches && savedSearches.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {savedSearches.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Recherches sauvegardées</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : !savedSearches || savedSearches.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Aucune recherche sauvegardée
            </div>
          ) : (
            <ScrollArea className="max-h-96">
              {savedSearches.map((search) => (
                <DropdownMenuItem
                  key={search.id}
                  className="flex flex-col items-start p-3 cursor-pointer"
                  onClick={() => handleApply(search)}
                >
                  <div className="flex items-start justify-between w-full gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{search.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {formatFilters(search.filters)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {timeAgo(search.createdAt)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => handleDelete(search.id, search.name, e)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Sidebar variant
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium mb-3">Recherches sauvegardées</div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Chargement...</div>
      ) : !savedSearches || savedSearches.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          Aucune recherche sauvegardée
        </div>
      ) : (
        <div className="space-y-2">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
              onClick={() => handleApply(search)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {search.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {formatFilters(search.filters)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => handleDelete(search.id, search.name, e)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
