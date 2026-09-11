import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { QueueModule } from '../queue/queue.module';
import { OutboxPublisher } from './outbox.publisher';
import { OutboxController } from './outbox.controller';

@Module({
  imports: [DatabaseModule, QueueModule],
  providers: [OutboxPublisher],
  controllers: [OutboxController],
})
export class OutboxModule {}
