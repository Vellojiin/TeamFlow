import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) {}

    async create(projectId: string, createTaskDto: CreateTaskDto) {
        const project = await this.prisma.client.project.findUnique({
            where: {
                id: projectId,
            },
            select: {
                id: true,
                organizationId: true,
            },
        });

        if (!project) {
            throw new NotFoundException('Proyecto no encontrado');
        }

        if (createTaskDto.assigneeId) {
        await this.ensureUserIsOrganizationMember(
        createTaskDto.assigneeId,
        project.organizationId,
    );
}

        return this.prisma.client.task.create({
            data: {
                title: createTaskDto.title,
                description: createTaskDto.description,
                priority: createTaskDto.priority,
                dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
                assigneeId: createTaskDto.assigneeId,
                projectId,
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async findAll(projectId: string) {
        return this.prisma.client.task.findMany({
            where: {
                projectId,
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findOne(projectId: string, taskId: string) {
        const task = await this.prisma.client.task.findUnique({
            where: {
                id: taskId,
                projectId,
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if(!task) {
            throw new NotFoundException('Tarea no encontrada');
        }

        return task;
    }

    async update(projectId: string, taskId: string, updateTaskDto: UpdateTaskDto) {
        await this.findOne(projectId, taskId);

        const project = await this.prisma.client.project.findUnique({
            where: {
                id: projectId,
            },
            select: {
                id: true,
                organizationId: true,
            },
        });

        if (!project) {
            throw new NotFoundException('Proyecto no encontrado');
        }

        if(updateTaskDto.assigneeId) {
            await this.ensureUserIsOrganizationMember(
                updateTaskDto.assigneeId,
                project.organizationId,
            );
        }

        return this.prisma.client.task.update({
            where: {
                id: taskId,
                projectId,
            },
            data: {
                title: updateTaskDto.title,
                description: updateTaskDto.description,
                priority: updateTaskDto.priority,
                dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
                assigneeId: updateTaskDto.assigneeId,
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                
            },
        });
    }

    async updateStatus(projectId: string, taskId: string, dto: UpdateTaskStatusDto) {
        await this.findOne(projectId, taskId);

        return this.prisma.client.task.update({
            where: {
                id: taskId,
            },
            data: {
                status: dto.status,
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async remove(projectId: string, taskId: string) {
        await this.findOne(projectId, taskId);

        return this.prisma.client.task.delete({
            where: {
                id: taskId,
            },
        });
        return {
            message: 'Tarea eliminada correctamente',
        }
    }

    private async ensureUserExists(userId: string) {
        const user = await this.prisma.client.user.findUnique({
            where: {
                id: userId,
            },
        });

        if(!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
    }

    private async ensureUserIsOrganizationMember(
    userId: string,
    organizationId: string,
) {
    const membership =
    await this.prisma.client.organizationMember.findFirst({
        where: {
        userId,
        organizationId,
        },
        select: {
        id: true,
        },
    });

    if (!membership) {
    throw new ForbiddenException(
        "Usuario no es miembro de la organización",
    );
    }
}
}