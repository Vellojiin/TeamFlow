import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class OutboxPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisher.name);
  private interval?: NodeJS.Timeout;
  private isPublishing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  onModuleInit() {
    this.interval = setInterval(
      () => {
        void this.publishPendingEvents();
      },
      1000,
    );

    void this.publishPendingEvents();
  }

  async publishPendingEvents() {
    if (this.isPublishing) {
      return;
    }

    this.isPublishing = true;

    try {
      const pendingEvents = await this.prisma.client.outboxEvent.findMany({
        where: {
          publishedAt: null,
        },
      });

      for (const event of pendingEvents) {
        try {
          await this.queueService.publish(event.type, event.payload, event.id);
          await this.prisma.client.outboxEvent.update({
            where: { id: event.id },
            data: { publishedAt: new Date() },
          });
        } catch (error) {
          this.logger.error(`Failed to publish event ${event.id}`, error);
        }
      }
    } finally {
      this.isPublishing = false;
    }
  }

  onModuleDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}