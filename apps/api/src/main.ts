import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  });

  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'], // Frontend et API
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const config = new DocumentBuilder()
    .setTitle('Seloger API')
    .setDescription('The Seloger API description')
    .setVersion('1.0')
    .addTag('seloger')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Enable global validation with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable automatic transformation
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert string to number
      },
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: false, // Don't throw error for extra properties
    }),
  );

  await app.listen(3000);
}

void bootstrap();
