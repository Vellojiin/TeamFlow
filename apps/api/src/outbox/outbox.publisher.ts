import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class OutboxPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisher.name);
  private interval?: NodeJS.Timeout;
  private isPublishing = false;
  private consecutiveFailures = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  onModuleInit() {
    void this.publishPendingEvents();
  }

  async getStatus() {
    const [pending, published, failed] = await Promise.all([
      this.prisma.client.outboxEvent.count({
        where: {
          publishedAt: null,
          attempts: 0,
        },
      }),

      this.prisma.client.outboxEvent.count({
        where: {
          publishedAt: {
            not: null,
          },
        },
      }),

      this.prisma.client.outboxEvent.count({
        where: {
          publishedAt: null,
          attempts: {
            gt: 0,
          },
        },
      }),
    ]);

    return {
      pending,
      published,
      failed,
    };
  }

  private scheduleNextRun() {
    const delay =
      this.consecutiveFailures === 0
        ? 1000
        : Math.min(1000 * 2 ** this.consecutiveFailures, 30000);

    this.interval = setTimeout(() => {
      void this.publishPendingEvents();
    }, delay);
  }

  private async publishEvent(event: {
    id: string;
    eventId: string;
    type: string;
    payload: unknown;
  }) {
    try {
      await this.queueService.publish(event.type, event.payload, event.eventId);

      await this.prisma.client.outboxEvent.update({
        where: {
          id: event.id,
        },
        data: {
          publishedAt: new Date(),
          lastAttemptAt: new Date(),
          lastError: null,
          attempts: {
            increment: 1,
          },
        },
      });

      this.logger.log(`Successfully published event ${event.id}`);

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await this.prisma.client.outboxEvent.update({
        where: {
          id: event.id,
        },
        data: {
          attempts: {
            increment: 1,
          },
          lastAttemptAt: new Date(),
          lastError: errorMessage,
        },
      });

      this.logger.error(
        `Failed to publish event ${event.id}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  async publishPendingEvents() {
    if (this.isPublishing) {
      return;
    }

    this.isPublishing = true;

    try {
      const events = await this.prisma.client.outboxEvent.findMany({
        where: {
          publishedAt: null,
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 50,
      });

      if (events.length === 0) {
        this.consecutiveFailures = 0;
        return;
      }

      // 1. Log inicial
      this.logger.log(`Outbox batch: ${events.length} events`);

      let publishedCount = 0;
      let failedCount = 0;

      // 2. Procesamiento y métricas
      for (const event of events) {
        const success = await this.publishEvent(event);

        if (success) {
          publishedCount++;
        } else {
          failedCount++;
        }
      }

      // 3. Ajuste del Backoff según fallos del lote completo
      if (failedCount > 0) {
        this.consecutiveFailures++;
      } else {
        this.consecutiveFailures = 0;
      }

      // 4. Log final del lote
      this.logger.log(
        `Outbox batch completed: total=${events.length} published=${publishedCount} failed=${failedCount}`,
      );
    } finally {
      this.isPublishing = false;
      this.scheduleNextRun();
    }
  }

  onModuleDestroy() {
    if (this.interval) {
      clearTimeout(this.interval);
    }
  }
}
