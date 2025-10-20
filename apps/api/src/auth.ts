import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@/generated/prisma';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: [process.env.WEB_URL],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log('Verification URL:', url, token, user);
      await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: user.email,
        subject: 'Hello World',
        html: `Coucou ${user.name}, Click the link to verify your email: ${url}`,
      });
    },
  },
});
