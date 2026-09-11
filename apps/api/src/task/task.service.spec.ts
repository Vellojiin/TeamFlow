import { TaskService } from './tasks.service';
import { ForbiddenException } from '@nestjs/common';

jest.mock('../database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('TasksService - Outbox', () => {
  it('creates task and outbox event in the same transaction', async () => {
    const createdTask = {
      id: 'task-1',
      title: 'Test task',
      projectId: 'project-1',
    };

    const tx = {
      task: {
        create: jest.fn().mockResolvedValue(createdTask),
      },
      outboxEvent: {
        create: jest.fn().mockResolvedValue({
          id: 'outbox-1',
        }),
      },
    };

    const prisma = {
      client: {
        project: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'project-1',
            organizationId: 'org-1',
          }),
        },
        $transaction: jest.fn().mockImplementation(async (callback) => {
          return callback(tx);
        }),
      },
    };

    const service = new TaskService(prisma as any);

    const result = await service.create(
      'org-1',
      'project-1',
      {
        title: 'Test task',
      },
      'user-1',
    );

    expect(result).toEqual(createdTask);

    expect(prisma.client.$transaction).toHaveBeenCalledTimes(1);

    expect(tx.task.create).toHaveBeenCalledTimes(1);

    expect(tx.outboxEvent.create).toHaveBeenCalledTimes(1);
  });

  it('rejects when project does not belong to the organization', async () => {
    const prisma = {
      client: {
        project: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
      },
    };

    const service = new TaskService(prisma as any);

    await expect(
      service.create(
        'org-1',
        'project-1',
        {
          title: 'Test task',
          assigneeId: 'user-2',
        },
        'user-1',
      ),
    ).rejects.toThrow('Proyecto no encontrado');
  });

  it('rejects an assignee outside the organization', async () => {
    const prisma = {
      client: {
        project: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'project-1',
            organizationId: 'org-1',
          }),
        },

        organizationMember: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
      },
    };

    const service = new TaskService(prisma as any);

    await expect(
      service.create(
        'org-1',
        'project-1',
        {
          title: 'Test task',
          assigneeId: 'user-2',
        },
        'user-1',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('creates a task and its outbox event atomically', async () => {
    const createdTask = {
      id: 'task-1',
      tittle: 'Test task',
      projectId: 'project-1',
    };

    const tx = {
      task: {
        create: jest.fn().mockResolvedValue(createdTask),
      },

      outboxEvent: {
        create: jest.fn().mockResolvedValue({ id: 'outbox-1' }),
      },
    };

    const prisma = {
      client: {
        project: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'project-1',
            organizationId: 'org-1',
          }),
        },

        $transaction: jest.fn(async (callback) => callback(tx)),
      },
    };

    const service = new TaskService(prisma as any);

    const result = await service.create(
      'org-1',
      'project-1',
      {
        title: 'Test task',
      },
      'user-1',
    );

    expect(result).toEqual(createdTask);

    expect(prisma.client.$transaction).toHaveBeenCalledTimes(1);

    expect(tx.task.create).toHaveBeenCalledTimes(1);

    expect(tx.outboxEvent.create).toHaveBeenCalledTimes(1);

    expect(tx.outboxEvent.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          eventId: expect.any(String),
          type: 'task.created',
          payload: expect.objectContaining({
            taskId: 'task-1',
            projectId: 'project-1',
            organizationId: 'org-1',
            userId: 'user-1',
          }),
        }),
      }),
    );
  });

  it('rolls back when creating the outbox event fails', async () => {
    const tx = {
      task: {
        create: jest.fn().mockResolvedValue({
          id: 'task-1',
          projectId: 'project-1',
        }),
      },

      outboxEvent: {
        create: jest
          .fn()
          .mockRejectedValue(new Error('Failed to create outbox event')),
      },
    };

    const prisma = {
      client: {
        project: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'project-1',
            organizationId: 'org-1',
          }),
        },
        $transaction: jest.fn(async (callback) => callback(tx)),
      },
    };
    const service = new TaskService(prisma as any);

    await expect(
      service.create(
        'org-1',
        'project-1',
        {
          title: 'Test task',
        },
        'user-1',
      ),
    ).rejects.toThrow('Failed to create outbox event');

    expect(tx.task.create).toHaveBeenCalledTimes(1);

    expect(tx.outboxEvent.create).toHaveBeenCalledTimes(1);
  });
});
