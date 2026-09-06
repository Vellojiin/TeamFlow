jest.mock('../database/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { OutboxPublisher } from './outbox.publisher';

describe('OutboxPublisher', () => {
    const event = {
        id: 'outbox-1',
        eventId: 'event-1',
        type: 'task.created',
        payload: {
            taskId: 'task-1'
        },
    };

    it('keeps event pending when queue publishing fails', async () => {
        const prisma = {
            client: {
                outboxEvent: {
                    update: jest.fn(),
                }
            }
        }

        const queueService = {
            publish: jest.fn().mockRejectedValue(new Error('Redis unavailable')),
        };

        const publisher = new OutboxPublisher(prisma as any, queueService as any)

        const result = await publisher['publishEvent'](event)

        expect(result).toBe(false)

        expect(queueService.publish).toHaveBeenCalledWith(
            'task.created',
            event.payload,
            'event-1'
        )

        expect(prisma.client.outboxEvent.update).toHaveBeenCalledWith(
            {
                where: {
                    id: 'outbox-1',
                },
                data: expect.objectContaining({
                    lastAttemptAt: expect.any(Date),
                    lastError: 'Redis unavailable',
                    attempts: {
                        increment: 1
                    }
                })
            }
        )
    });

    it('marks event as published after succeful delivery', async () => {
        const prisma = {
            client: {
                outboxEvent: {
                    update: jest.fn(),
                }
            }
        }

        const queueService = {
            publish: jest.fn().mockResolvedValue({
                id: 'bullmq-job-1'
            }),
        };

        const publisher = new OutboxPublisher(prisma as any, queueService as any)

        const result = await publisher['publishEvent'](event)

        expect(result).toBe(true)

        expect(queueService.publish).toHaveBeenCalledWith(
            'task.created',
            event.payload,
            'event-1'
        )

        expect(prisma.client.outboxEvent.update).toHaveBeenCalledWith(
            {
                where: {
                    id: 'outbox-1',
                },
                data: expect.objectContaining({
                    lastAttemptAt: expect.any(Date),
                    publishedAt: expect.any(Date),
                    attempts: {
                        increment: 1
                    }
                })
            }
        )
    })
});