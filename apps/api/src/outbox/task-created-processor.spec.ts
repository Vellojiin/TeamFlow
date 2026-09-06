
const { TaskCreatedProcessor } = require('../../../worker/src/queue/task-created.processor');

const TASK_CREATED_EVENT = 'task.created';

jest.mock('@teamflow/database', () => ({
  PrismaService: class PrismaService {},
}));

describe('TaskCreatedProcessor', () => {
  it('handles duplicate events gracefully (P2002 idempotency)', async () => {
    const mockJob = {
      name: TASK_CREATED_EVENT,
      data: {
        eventId: 'event-dup-1',
        taskId: 'task-1',
        userId: 'user-1',
        organizationId: 'org-1',
      },
    };

    const prismaService = {
      client: {
        task: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'task-1',
            title: 'Test Task',
            projectId: 'project-1',
          }),
        },
        activityLog: {
          create: jest.fn().mockRejectedValue(
            Object.assign(new Error('Duplicate key'), { code: 'P2002' }),
          ),
        },
      },
    };

    const configService = {
      get: jest.fn().mockReturnValue('localhost'),
    };

    const processor = new TaskCreatedProcessor(
      configService as any,
      prismaService as any,
    );

    // No debe lanzar excepción al simular el duplicado P2002
    await expect(
      processor['handleTaskCreated'](mockJob as any),
    ).resolves.not.toThrow();

    expect(prismaService.client.activityLog.create).toHaveBeenCalledTimes(1);
  });
});