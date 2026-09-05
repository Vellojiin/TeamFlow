import { Module } from '@nestjs/common';
import { DomainEventBusService } from './domain-event-bus.service';
import { QueueModule } from '../queue/queue.module';

@Module({
    providers: [DomainEventBusService],
    imports: [QueueModule],
    exports: [DomainEventBusService],
})
export class EventsModule {}