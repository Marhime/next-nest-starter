/**
 * Profile Page
 * Display user profile and account settings
 */

import { Suspense } from 'react';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Mon Profil</h1>
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
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              Connectez-vous pour accéder à votre profil
            </h2>
            <p className="text-muted-foreground">
              Créez un compte ou connectez-vous pour gérer vos informations
            </p>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
