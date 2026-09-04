import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ActivityType, Prisma } from '@prisma/client';

@Injectable()
export class ActivityLogService {
    constructor(private readonly prisma: PrismaService) {}

    async create(param: {
        eventId: string,
        type: ActivityType,
        organizationId: string,
        userId?: string,
        taskId?: string,
        projectId?: string,
        metadata?: Prisma.InputJsonValue,
    }) {
        return this.prisma.client.activityLog.create({
            data: {
                type: param.type,
                organizationId: param.organizationId,
                userId: param.userId,
                taskId: param.taskId,
                projectId: param.projectId,
                metadata: param.metadata,
                eventId: param.eventId,
            },
        });
    }

    async findByOrganizationId(organizationId: string) {
        return this.prisma.client.activityLog.findMany({
            where: {
                organizationId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                task: {
                    select: {
                        id: true,
                        title: true,
                    }
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
            },
        });
    }
}