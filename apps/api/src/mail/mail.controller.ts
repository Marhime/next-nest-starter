import { Controller, Get, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /**
   * Test endpoint to send a simple HTML email
   * GET /mail/test?email=test@example.com
   */
  @Get('test')
  async testEmail(@Query('email') email?: string) {
    const testEmail = email || 'dimitri.coppet972@gmail.com';

    try {
      await this.mailService.sendEmail(
        testEmail,
        '🧪 Email de test',
        '<p>Ceci est un email de test depuis le MailService avec <strong>Resend</strong>.</p>',
      );

      return {
        success: true,
        message: `Email envoyé avec succès à ${testEmail}`,
      };
    } catch (error) {
      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test endpoint to send a welcome email
   * GET /mail/test-welcome?email=test@example.com&name=John
   */
  @Get('test-welcome')
  async testWelcomeEmail(
    @Query('email') email?: string,
    @Query('name') name?: string,
  ) {
    const testEmail = email || 'dimitri.coppet972@gmail.com';
    const testName = name || 'Utilisateur Test';

    try {
      await this.mailService.sendWelcomeEmail(testEmail, testName);

      return {
        success: true,
        message: `Email de bienvenue envoyé avec succès à ${testEmail}`,
      };
    } catch (error) {
      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test endpoint to send a verification email
   * GET /mail/test-verification?email=test@example.com&name=John
   */
  @Get('test-verification')
  async testVerificationEmail(
    @Query('email') email?: string,
    @Query('name') name?: string,
  ) {
    const testEmail = email || 'dimitri.coppet972@gmail.com';
    const testName = name || 'Utilisateur Test';
    const testToken = 'test-verification-token-123';

    try {
      await this.mailService.sendVerificationEmail(
        testEmail,
        testName,
        testToken,
      );

      return {
        success: true,
        message: `Email de vérification envoyé avec succès à ${testEmail}`,
        note: 'Le token de test est: test-verification-token-123',
      };
    } catch (error) {
      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test endpoint to send a password reset email
   * GET /mail/test-reset?email=test@example.com&name=John
   */
  @Get('test-reset')
  async testPasswordResetEmail(
    @Query('email') email?: string,
    @Query('name') name?: string,
  ) {
    const testEmail = email || 'dimitri.coppet972@gmail.com';
    const testName = name || 'Utilisateur Test';
    const testToken = 'test-reset-token-456';

    try {
      await this.mailService.sendPasswordResetEmail(
        testEmail,
        testName,
        testToken,
      );

      return {
        success: true,
        message: `Email de réinitialisation envoyé avec succès à ${testEmail}`,
        note: 'Le token de test est: test-reset-token-456',
      };
    } catch (error) {
      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
