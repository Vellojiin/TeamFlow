import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from './queue/queue.module';
import { TaskCreatedProcessor } from './queue/task-created.processor';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        QueueModule,
    ],
    providers: [TaskCreatedProcessor],
})
export class AppModule {}
