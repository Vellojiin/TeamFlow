import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { TASK_QUEUE } from '@teamflow/queue';

@Injectable()
export class QueueService implements OnModuleDestroy {
  // Opcional: usas unknown para indicar que el payload puede ser de cualquier tipo seguro
    private readonly taskQueue: Queue<unknown, void, string>;

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

    async publish<T = unknown>(
    type: string,
    payload: T,
    eventId: string,
    ) {
    return this.taskQueue.add(type, payload, {
        jobId: eventId,
        attempts: 3,
        backoff: {
        type: 'exponential',
        delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
    });
    }

    async onModuleDestroy() {
    await this.taskQueue.close();
    }
}