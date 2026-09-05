import { Injectable } from '@nestjs/common';
import { TASK_CREATED_EVENT, TaskCreatedEvent } from '@teamflow/events';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class DomainEventBusService {
    constructor(private readonly queueService: QueueService) {}

    async publishTaskCreated(event: TaskCreatedEvent) {
        return this.queueService.addTaskCreatedJob(event);
    }
}