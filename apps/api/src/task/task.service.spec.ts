import { TaskService } from "./tasks.service";

jest.mock("../database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

describe("TasksService - Outbox", () => {
  it("creates task and outbox event in the same transaction", async () => {
    const createdTask = {
      id: "task-1",
      title: "Test task",
      projectId: "project-1",
    };

    const tx = {
      task: {
        create: jest.fn().mockResolvedValue(createdTask),
      },
      outboxEvent: {
        create: jest.fn().mockResolvedValue({
          id: "outbox-1",
        }),
      },
    };

    const prisma = {
      client: {
        project: {
          findFirst: jest.fn().mockResolvedValue({
            id: "project-1",
            organizationId: "org-1",
          }),
        },
        $transaction: jest
          .fn()
          .mockImplementation(async (callback) => {
            return callback(tx);
          }),
      },
    };

    const service = new TaskService(
      prisma as any,
    );

    const result = await service.create(
      "org-1",
      "project-1",
      {
        title: "Test task",
      },
      "user-1",
    );

    expect(result).toEqual(createdTask);

    expect(
      prisma.client.$transaction,
    ).toHaveBeenCalledTimes(1);

    expect(
      tx.task.create,
    ).toHaveBeenCalledTimes(1);

    expect(
      tx.outboxEvent.create,
    ).toHaveBeenCalledTimes(1);
  });
});