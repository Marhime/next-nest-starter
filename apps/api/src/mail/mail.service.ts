import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { RESEND_CLIENT } from './resend.module';
import { EmailTemplateService } from './email-template.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly emailFrom: string;

  constructor(
    @Inject(RESEND_CLIENT) private readonly resend: Resend,
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {
    this.emailFrom =
      this.configService.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.emailFrom,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(
    to: string,
    userName: string,
    lang: string = 'es',
  ): Promise<void> {
    try {
      const { subject, html } = await this.emailTemplateService.getWelcomeEmail(
        userName,
        lang,
      );

      await this.resend.emails.send({
        from: this.emailFrom,
        to,
        subject,
        html,
      });
      this.logger.log(`Welcome email sent to ${to} (lang: ${lang})`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(
    to: string,
    userName: string,
    verificationToken: string,
    lang: string = 'es',
  ): Promise<void> {
    try {
      const webUrl = this.configService.get<string>('WEB_URL');
      const verificationUrl = `${webUrl}/auth/verify-email?token=${verificationToken}`;

      const { subject, html } =
        await this.emailTemplateService.getVerificationEmail(
          userName,
          verificationUrl,
          lang,
        );

      await this.resend.emails.send({
        from: this.emailFrom,
        to,
        subject,
        html,
      });
      this.logger.log(`Verification email sent to ${to} (lang: ${lang})`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}:`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(
    to: string,
    userName: string,
    resetToken: string,
    lang: string = 'es',
  ): Promise<void> {
    try {
      const webUrl = this.configService.get<string>('WEB_URL');
      const resetUrl = `${webUrl}/auth/forgot-password?token=${resetToken}`;

      const { subject, html } =
        await this.emailTemplateService.getPasswordResetEmail(
          userName,
          resetUrl,
          lang,
        );

      await this.resend.emails.send({
        from: this.emailFrom,
        to,
        subject,
        html,
      });
      this.logger.log(`Password reset email sent to ${to} (lang: ${lang})`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}:`, error);
      throw error;
    }
  }
}

// Standalone functions for use in auth.ts (without dependency injection)
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string,
  lang: string = 'es',
): Promise<void> => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const webUrl = process.env.WEB_URL;
  const resetUrl = `${webUrl}/auth/forgot-password?token=${resetToken}`;

  // Simple template for standalone function
  const subjects: Record<string, string> = {
    en: '🔒 Password Reset',
    fr: '🔒 Réinitialisation de mot de passe',
    es: '🔒 Restablecimiento de contraseña',
  };

  const subject = subjects[lang] || subjects.en;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>${subject}</h1>
        <p>Hello ${name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
        <p style="margin-top: 20px; color: #666;">Or copy this link: ${resetUrl}</p>
      </div>
    `,
  });
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string,
  lang: string = 'es',
): Promise<void> => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const webUrl = process.env.WEB_URL;
  const verificationUrl = `${webUrl}/auth/verify-email?token=${verificationToken}`;

  // Simple template for standalone function
  const subjects: Record<string, string> = {
    en: '✉️ Verify your email',
    fr: '✉️ Vérifiez votre adresse email',
    es: '✉️ Verifica tu correo',
  };

  const subject = subjects[lang] || subjects.en;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>${subject}</h1>
        <p>Hello ${name},</p>
        <p>Thank you for signing up! Click the link below to verify your email:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px;">
          Verify Email
        </a>
        <p style="margin-top: 20px; color: #666;">Or copy this link: ${verificationUrl}</p>
      </div>
    `,
  });
};
