import { Controller, Get, Query } from '@nestjs/common';
import { MailService, sendWelcomeEmailHelper } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test')
  async testEmail(@Query('email') email?: string) {
    const testEmail = email || 'dimitri.coppet972@gmail.com';
    
    try {
      await this.mailService.sendEmail(
        testEmail,
        '🧪 Email de test',
        'Ceci est un email de test depuis le MailService'
      );
      
      return {
        success: true,
        message: `Email envoyé avec succès à ${testEmail}`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

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
        message: 'Erreur lors de l\'envoi de l\'email',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Get('test-html')
  async testHtmlEmail(
    @Query('email') email?: string,
    @Query('subject') subject?: string,
  ) {
    const testEmail = email || 'dimitri.coppet972@gmail.com';
    const testSubject = subject || '🎨 Test Email HTML';
    
    try {
      await this.mailService.sendHtmlEmail(
        testEmail,
        testSubject,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Test d'envoi d'email HTML</h1>
            <p>Ceci est un email de test pour vérifier que la configuration SMTP fonctionne correctement.</p>
            <p>Si vous recevez cet email, tout est bien configuré ! ✅</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Envoyé depuis le MailService</p>
          </div>
        `
      );
      
      return {
        success: true,
        message: `Email HTML envoyé avec succès à ${testEmail}`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email HTML',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Get('test-helper')
  async testWelcomeEmailHelper(
    @Query('email') email?: string,
    @Query('name') name?: string,
  ) {
    const testEmail = email || 'dimitri.coppet972@gmail.com';
    const testName = name || 'Utilisateur Test';
    
    try {
      await sendWelcomeEmailHelper(testEmail, testName);
      
      return {
        success: true,
        message: `Email de bienvenue (helper) envoyé avec succès à ${testEmail}`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email helper',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
