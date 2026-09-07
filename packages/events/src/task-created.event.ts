export const TASK_CREATED_EVENT = "task.created";

export interface TaskCreatedEvent {
    eventId: string;
    taskId: string;
    projectId: string;
    organizationId: string;
    userId: string;
    occurredAt: string;
}