import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { TASK_QUEUE, TASK_CREATE_JOB, TaskCreatedJobData } from '@teamflow/queue';
import { TASK_CREATED_EVENT, TaskCreatedEvent } from '@teamflow/events';

@Injectable()
export class QueueService implements OnModuleDestroy {
    private readonly taskQueue: Queue<TaskCreatedJobData>;

    constructor(private readonly configService: ConfigService) {
        const host = this.configService.get<string>('REDIS_HOST') ?? 'localhost';
        const port = this.configService.get<number>('REDIS_PORT') ?? 6379;
        this.taskQueue = new Queue(TASK_QUEUE, {
            connection: {
                host,
                port,
            },
        });
    }

    async addTaskCreatedJob(event: TaskCreatedEvent){
        return this.taskQueue.add(TASK_CREATED_EVENT, event,{
            jobId: event.taskId,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            },
            removeOnComplete: 100,
            removeOnFail: 500,
            }
        );
    }

    async onModuleDestroy() {
        await this.taskQueue.close();
    }
}