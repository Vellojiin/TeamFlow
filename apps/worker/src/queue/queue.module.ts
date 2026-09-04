import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TaskCreatedProcessor } from './task-created.processor';

@Module({
    imports: [ConfigModule],
    providers: [TaskCreatedProcessor],
})
export class QueueModule {}
