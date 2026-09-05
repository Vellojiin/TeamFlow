import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import { TASK_QUEUE, TASK_CREATE_JOB, TaskCreatedJobData } from '@teamflow/queue';
import { PrismaService } from '@teamflow/database';

@Injectable()
export class TaskCreatedProcessor implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(TaskCreatedProcessor.name);
    private worker!: Worker<TaskCreatedJobData>;

    constructor(
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService,
    ) {}

    onModuleInit() {
        const host = this.configService.get<string>('REDIS_HOST') ?? 'localhost';
        const port = this.configService.get<number>('REDIS_PORT') ?? 6379;

        this.worker = new Worker<TaskCreatedJobData>(
            TASK_QUEUE,
            async (job: Job<TaskCreatedJobData>) => {
                switch (job.name) {
                    case TASK_CREATE_JOB:
                        await this.handleTaskCreated(job.data);
                        break;
                    default:
                        this.logger.log(`Activity created for task ${job.data.taskId}`);
                }
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

    private async handleTaskCreated(data: TaskCreatedJobData) {
        this.logger.log(`Processing task-created job for task ${data.taskId}`);

        const task = await this.prismaService.client.task.findUnique({
            where: {
                id: data.taskId,
            },
            select: {
                id: true,
                title: true,
                projectId: true,
            },
        });

        if (!task) {
            throw new Error(`Task ${data.taskId} not found`);
        }

        await this.prismaService.client.activityLog.create({
            data: {
                eventId: task.id,
                type: 'TASK_CREATED',
                organizationId: data.organizationId,
                userId: data.userId,
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
