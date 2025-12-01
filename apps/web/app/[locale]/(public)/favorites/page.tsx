/**
 * Favorites Page
 * Display user's favorite properties
 */

import { Suspense } from 'react';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Mes Favoris</h1>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          }
        >
          {/* Empty state for now */}
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              Aucun favori pour le moment
            </h2>
            <p className="text-muted-foreground">
              Explorez des propriétés et ajoutez-les à vos favoris pour les
              retrouver ici
            </p>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
