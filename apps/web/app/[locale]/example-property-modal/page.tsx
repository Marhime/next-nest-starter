'use client';

import { AddPropertyButton } from '@/components/AddPropertyButton';

export default function ExampleUsagePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">
          Exemple d&apos;utilisation du PropertyTypeModal
        </h1>
        <p className="text-muted-foreground mb-6">
          Cliquez sur le bouton ci-dessous pour ouvrir la modal de sélection de
          type de bien.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Bouton par défaut</h2>
          <AddPropertyButton />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Bouton outline</h2>
          <AddPropertyButton variant="outline" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            Bouton avec texte personnalisé
          </h2>
          <AddPropertyButton variant="secondary">
            Créer un nouveau bien
          </AddPropertyButton>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Bouton large</h2>
          <AddPropertyButton size="lg" className="w-full max-w-md" />
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Comment utiliser :</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            Importez le composant :{' '}
            <code className="bg-background px-2 py-1 rounded">
              import {`{ AddPropertyButton }`} from
              &apos;@/components/AddPropertyButton&apos;
            </code>
          </li>
          <li>Utilisez-le n&apos;importe où dans votre application</li>
          <li>La modal s&apos;ouvre automatiquement au clic</li>
          <li>
            Sélectionnez un type de bien (Maison, Appartement, ou Terrain)
          </li>
          <li>Le bien est créé automatiquement via l&apos;API</li>
          <li>Vous êtes redirigé vers /add-property/[id] pour continuer</li>
        </ol>
      </div>
    </div>
  );
}
