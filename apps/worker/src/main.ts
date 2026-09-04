import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Worker');
    // Standalone application context: no HTTP server needed, just the DI container
    // so the QueueModule/TaskCreatedProcessor can start consuming BullMQ jobs.
    await NestFactory.createApplicationContext(AppModule);
    logger.log('🚀 TeamFlow Worker started');
}

bootstrap();
