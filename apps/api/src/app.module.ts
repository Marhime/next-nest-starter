import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PropertiesModule } from './properties/properties.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import {
  I18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import { PhotosModule } from './photos/photos.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: {
        path: path.join(__dirname, '../../i18n/'),
        watch: true,
      },
      resolvers: [new HeaderResolver(['x-locale']), AcceptLanguageResolver],
    }),
    AuthModule.forRoot({ auth }),
    UsersModule,
    PropertiesModule,
    PrismaModule,
    MailModule,
    PhotosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
