import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

// Instance better-auth pour le client Next.js
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  basePath: '/api/auth',
  plugins: [
    adminClient(), // Plugin admin pour gérer les rôles
  ],
});
