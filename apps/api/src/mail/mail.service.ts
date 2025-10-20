import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';

// Fonction helper pour envoyer l'email de bienvenue (utilisable hors contexte NestJS donc pour auth.ts qui utilise better-auth)
export async function sendWelcomeEmailHelper(email: string, name: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'noreply@nestjs.com',
    to: email,
    subject: '🎉 Bienvenue sur notre plateforme !',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Bienvenue ${name} !</h1>
        <p>Nous sommes ravis de vous accueillir sur notre plateforme.</p>
        <p>Votre compte a été créé avec succès.</p>
        <p>Vous pouvez maintenant vous connecter et profiter de tous nos services.</p>
        <br>
        <p>Cordialement,<br>L'équipe</p>
      </div>
    `,
  });
}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  // Méthode simple pour envoyer un email
  async sendEmail(to: string, subject: string, text: string) {
    await this.mailerService.sendMail({
      to,
      subject,
      text,
    });
  }

  // Méthode avec email de bienvenue
  async sendWelcomeEmail(to: string, userName: string) {
    await this.mailerService.sendMail({
      to,
      from: process.env.MAIL_FROM || 'noreply@nestjs.com',
      subject: '🎉 Bienvenue sur notre plateforme !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Bienvenue ${userName} !</h1>
          <p>Nous sommes ravis de vous accueillir sur notre plateforme.</p>
          <p>Votre compte a été créé avec succès.</p>
          <p>Vous pouvez maintenant vous connecter et profiter de tous nos services.</p>
          <br>
          <p>Cordialement,<br>L'équipe</p>
        </div>
      `,
    });
  }

  // Méthode générique pour envoyer un email avec HTML
  async sendHtmlEmail(to: string, subject: string, html: string) {
    await this.mailerService.sendMail({
      to,
      from: process.env.MAIL_FROM || 'noreply@nestjs.com',
      subject,
      html,
    });
  }



  // Méthode pour envoyer un email de réinitialisation de mot de passe
  async sendPasswordResetEmail(to: string, resetToken: string) {
    const resetUrl = `${process.env.WEB_URL}/auth/reset-password?token=${resetToken}`;
    
    await this.mailerService.sendMail({
      to,
      from: process.env.MAIL_FROM || 'noreply@nestjs.com',
      subject: '🔒 Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Réinitialisation de mot de passe</h1>
          <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p>Ce lien est valide pendant 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          <br>
          <p>Cordialement,<br>L'équipe</p>
        </div>
      `,
    });
  }

  // Méthode pour envoyer un email de vérification
  async sendVerificationEmail(to: string, verificationToken: string) {
    const verificationUrl = `${process.env.WEB_URL}/auth/verify?token=${verificationToken}`;
    
    await this.mailerService.sendMail({
      to,
      from: process.env.MAIL_FROM || 'noreply@nestjs.com',
      subject: '✉️ Vérifiez votre adresse email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Vérification de votre email</h1>
          <p>Merci de vous être inscrit !</p>
          <p>Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Vérifier mon email
          </a>
          <p>Ce lien est valide pendant 24 heures.</p>
          <br>
          <p>Cordialement,<br>L'équipe</p>
        </div>
      `,
    });
  }
}
