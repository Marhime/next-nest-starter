'use client';

import React, { useState, useCallback } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCurrentSearch } from '@/hooks/use-saved-searches';
import { useProtectedAction } from '@/hooks/use-protected-action';
import { toast } from 'sonner';

interface SavedSearchButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export function SavedSearchButton({
  variant = 'outline',
  size = 'sm',
  showLabel = true,
  className,
}: SavedSearchButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const { saveSearch, isLoading } = useSaveCurrentSearch();
  const { requireAuth } = useProtectedAction();

  // Open dialog only if authenticated, otherwise open login modal
  const handleButtonClick = useCallback(async () => {
    await requireAuth(
      async () => {
        // User is authenticated, open the dialog
        setIsOpen(true);
      },
      'save_search',
      {},
      'register', // Encourage registration for advanced feature
    );
  }, [requireAuth]);

  const handleSave = useCallback(() => {
    if (!searchName.trim()) {
      toast.error('Veuillez entrer un nom pour cette recherche');
      return;
    }

    saveSearch(searchName, {
      onSuccess: () => {
        toast.success(`"${searchName}" a été ajoutée à vos recherches`);
        setSearchName('');
        setIsOpen(false);
      },
      onError: (err: Error) => {
        toast.error(
          err.message === 'You must be logged in to save searches'
            ? 'Vous devez être connecté pour sauvegarder une recherche'
            : 'Impossible de sauvegarder cette recherche',
        );
      },
    });
  }, [searchName, saveSearch]);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleButtonClick}
      >
        <Bookmark className="w-4 h-4" />
        {showLabel && <span className="ml-2">Sauvegarder</span>}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sauvegarder cette recherche</DialogTitle>
            <DialogDescription>
              Donnez un nom à cette recherche pour la retrouver facilement plus
              tard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="search-name">Nom de la recherche</Label>
              <Input
                id="search-name"
                placeholder="Ex: Appartement Paris centre"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSave();
                  }
                }}
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !searchName.trim()}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
