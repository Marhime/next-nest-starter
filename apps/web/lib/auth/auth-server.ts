import { betterAuth } from 'better-auth';

// Instance better-auth pour le serveur Next.js
// Utilisée uniquement pour les appels API côté serveur
export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
  // Cette instance est utilisée uniquement pour faire des requêtes à l'API
  // Elle n'a pas besoin de la configuration complète
});
