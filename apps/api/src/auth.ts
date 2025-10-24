import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@/generated/prisma';
import { Resend } from 'resend';
import { admin, customSession } from 'better-auth/plugins';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: [process.env.WEB_URL],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: 'USER',
      adminRoles: ['ADMIN'], // Seuls les users avec le rôle 'ADMIN' ont les privilèges admin
    }),
    customSession(async ({ user, session }) => {
      return {
        user: {
          ...user,
          role: user.role, // Ajoute le rôle dans la réponse
        },
        session,
      };
    }),
  ],
});
