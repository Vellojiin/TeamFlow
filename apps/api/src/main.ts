import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API for the TeamFlow application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

    const document = require('@nestjs/swagger').SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document); 

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();