import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class EmailTemplateService {
  constructor(private readonly i18n: I18nService) {}

  /**
   * Generate verification email template with translations
   */
  async getVerificationEmail(
    name: string,
    verificationUrl: string,
    lang: string = 'es',
  ): Promise<{ subject: string; html: string }> {
    const t = (key: string, args?: Record<string, any>) =>
      this.i18n.translate(`mail.verification.${key}`, {
        lang,
        args: args || {},
      });

    const subject = await t('subject');
    const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${await t('title')}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${await t('title')}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">${await t('greeting', { name })}</h2>
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ${await t('thankYou')}
              </p>
              <p style="margin: 0 0 25px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ${await t('instructions')}
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                      ${await t('button')}
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 25px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                ${await t('orCopy')}
              </p>
              <p style="margin: 10px 0 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                ${verificationUrl}
              </p>
              
              <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  ${await t('expiresIn')}
                </p>
              </div>
              
              <p style="margin: 25px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                ${await t('notYou')}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 1.5;">
                ${await t('regards')}<br>
                <strong>${await t('team')}</strong>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                ${await t('footer')}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    return { subject, html };
  }

  /**
   * Generate welcome email template with translations
   */
  async getWelcomeEmail(
    name: string,
    lang: string = 'es',
  ): Promise<{ subject: string; html: string }> {
    const t = (key: string, args?: Record<string, any>) =>
      this.i18n.translate(`mail.welcome.${key}`, {
        lang,
        args: args || {},
      });

    const subject = await t('subject');
    const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${await t('title')}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${await t('title')}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">${await t('greeting', { name })}</h2>
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ${await t('message')}
              </p>
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ${await t('accountCreated')}
              </p>
              <p style="margin: 0 0 25px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ${await t('questions')}
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <a href="${process.env.WEB_URL}/auth/login" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                      ${await t('button')}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 1.5;">
                ${await t('regards')}<br>
                <strong>${await t('team')}</strong>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                ${await t('footer')}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    return { subject, html };
  }

  /**
   * Generate password reset email template with translations
   */
  async getPasswordResetEmail(
    name: string,
    resetUrl: string,
    lang: string = 'es',
  ): Promise<{ subject: string; html: string }> {
    const t = (key: string, args?: Record<string, any>) =>
      this.i18n.translate(`mail.passwordReset.${key}`, {
        lang,
        args: args || {},
      });

    const subject = await t('subject');
    const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${await t('title')}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${await t('title')}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">${await t('greeting', { name })}</h2>
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ${await t('requested')}
              </p>
              <p style="margin: 0 0 25px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ${await t('instructions')}
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                      ${await t('button')}
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 25px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                ${await t('orCopy')}
              </p>
              <p style="margin: 10px 0 0 0; color: #3b82f6; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  ${await t('expiresIn')}
                </p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  ${await t('notYou')}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 1.5;">
                ${await t('regards')}<br>
                <strong>${await t('team')}</strong>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                ${await t('footer')}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    return { subject, html };
  }
}
