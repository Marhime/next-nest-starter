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
    requireEmailVerification: true, // Requiert la vérification d'email pour se connecter
  },
  emailVerification: {
    sendOnSignUp: true, // Envoie automatiquement l'email lors de l'inscription
    autoSignInAfterVerification: false, // L'utilisateur doit se connecter manuellement après vérification
    sendVerificationEmail: async ({ user, token }) => {
      // URL de vérification personnalisée avec le token
      const verificationUrl = `${process.env.WEB_URL}/auth/verify-email?token=${token}`;
      
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
          to: user.email,
          subject: 'Vérifiez votre adresse email',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Bienvenue !</h2>
              <p>Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
              <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Vérifier mon email
              </a>
              <p>Ou copiez ce lien dans votre navigateur :</p>
              <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Ce lien expire dans 24 heures.</p>
            </div>
          `,
        });
      } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
      }
    },
  },
  plugins: [
    admin({
      defaultRole: 'REGULAR',
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
