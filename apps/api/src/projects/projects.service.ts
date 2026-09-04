import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(organizationId: string, createProjectDto: CreateProjectDto) {
        const organization = await this.prisma.client.organization.findUnique({
            where: {
                id: organizationId,
            },
            select: {
                id: true,
            }
        });

        if (!organization) {
            throw new NotFoundException("Organizacion no encontrada")
        };

        return this.prisma.client.project.create({
            data: {
                name: createProjectDto.name,
                description: createProjectDto.description,
                organizationId,
            },
        });
    }

    async findAll(organizationId: string) {
        return this.prisma.client.project.findMany({
            where: {
                organizationId,
            },
            orderBy: {
                createdAt: "desc"
            },
        });
    }

    async findOne(organizationId: string, projectId: string) {
        const project = await this.prisma.client.project.findFirst({
            where: {
                id: projectId,
                organizationId,
            },
        });

        if (!project) {
            throw new NotFoundException("Proyecto no encontrado");
        }
        return project;
    }

    async update(organizationId: string, projectId: string, updateProjectDto: UpdateProjectDto) {
        await this.findOne(organizationId, projectId);

        return this.prisma.client.project.update({
            where: {
                id: projectId,
            },
            data: updateProjectDto,
        });
    }

    async remove(organizationId: string, projectId: string) {
        await this.findOne(organizationId, projectId);

        await this.prisma.client.project.delete({
            where: {
                id: projectId,
            },
        });

        return {
            message: "Proyecto eliminado exitosamente"
        }
    }
}