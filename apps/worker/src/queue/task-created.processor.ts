import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import { TASK_QUEUE } from '@teamflow/queue';
import { PrismaService } from '@teamflow/database';
import { TASK_CREATED_EVENT, TaskCreatedEvent } from '@teamflow/events';

@Injectable()
export class TaskCreatedProcessor implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(TaskCreatedProcessor.name);
    private worker!: Worker<TaskCreatedEvent>;

    constructor(
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService,
    ) {}

    onModuleInit() {
        const host = this.configService.get<string>('REDIS_HOST') ?? 'localhost';
        const port = this.configService.get<number>('REDIS_PORT') ?? 6379;

        this.worker = new Worker<TaskCreatedEvent>(
            TASK_QUEUE,
            async (job: Job<TaskCreatedEvent>) => {
                await this.handleTaskCreated(job);
            },
            {
                connection: {
                    host,
                    port,
                },
            },
        );

        this.worker.on('completed', (job) => {
            this.logger.log(`Job ${job.id} (${job.name}) completed`);
        });

        this.worker.on('failed', (job, err) => {
            this.logger.error(`Job ${job?.id} (${job?.name}) failed: ${err.message}`);
        });
    }

    private async handleTaskCreated(job: Job<TaskCreatedEvent>) {
        if (job.name !== TASK_CREATED_EVENT) {
            this.logger.warn(`Unknown job: ${job.name}`);
            return;
        }

        const event = job.data as TaskCreatedEvent;

        const {
            eventId,
            taskId,
            userId,
            organizationId,
        } = event;

        this.logger.log(`Processing task-created job for task ${taskId}`);

        const task = await this.prismaService.client.task.findUnique({
            where: {
                id: taskId,
            },
            select: {
                id: true,
                title: true,
                projectId: true,
            },
        });

        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        await this.prismaService.client.activityLog.create({
            data: {
                eventId,
                type: 'TASK_CREATED',
                organizationId,
                userId,
                taskId: task.id,
                projectId: task.projectId,
                metadata: {
                    title: task.title,
                },
            },
        });
    }

    async onModuleDestroy() {
        await this.worker.close();
    }
}