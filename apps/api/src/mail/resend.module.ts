import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export const RESEND_CLIENT = 'RESEND_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: RESEND_CLIENT,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
          throw new Error(
            'RESEND_API_KEY is not defined in environment variables',
          );
        }
        return new Resend(apiKey);
      },
      inject: [ConfigService],
    },
  ],
  exports: [RESEND_CLIENT],
})
export class ResendModule {}
