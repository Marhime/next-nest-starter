import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@/generated/prisma';
import { admin, customSession } from 'better-auth/plugins';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from './mail/mail.service';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: [process.env.WEB_URL],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      const email = user.email as string;
      const name = (user.name as string) || 'User';
      // Fetch user's preferred language from database
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { preferredLanguage: true },
      });
      const lang = (dbUser?.preferredLanguage as string) || 'es';
      await sendPasswordResetEmail(email, name, token, lang);
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      try {
        const email = user.email as string;
        const name = (user.name as string) || 'User';
        // Fetch user's preferred language from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { preferredLanguage: true },
        });
        const lang = (dbUser?.preferredLanguage as string) || 'en';
        await sendVerificationEmail(email, name, token, lang);
      } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
      }
    },
  },
  plugins: [
    admin({
      defaultRole: 'REGULAR',
      adminRoles: ['ADMIN'],
    }),
    customSession(async ({ user, session }) => {
      return {
        user: {
          ...user,
          role: user.role,
        },
        session,
      };
    }),
  ],
});
