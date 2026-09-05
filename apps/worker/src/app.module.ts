import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from './queue/queue.module';
import { TaskCreatedProcessor } from './queue/task-created.processor';
import { DatabaseModule } from '@teamflow/database';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        QueueModule,
        DatabaseModule,
    ],
    providers: [TaskCreatedProcessor],
})
export class AppModule {}
