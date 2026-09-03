import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

const isUniqueConstraintError = (error: unknown): boolean => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
    );
};

@Injectable()
export class OrganizationsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateOrganizationDto, id: string) {
        try {

            return await this.prisma.client.$transaction(async (tx) => {
                const organization = await tx.organization.create({
                    data: { 
                        name: dto.name, 
                        slug: dto.slug, 
                    },
                });

                await tx.organizationMember.create({
                    data: {
                        organizationId: organization.id,
                        userId: id,
                        role: "OWNER"
                    },
                });

                return organization;
            });
        } catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new ConflictException('La organizacion ya existe');
            }
            throw error;
        }
    }

    async findAll(userId: string) {
        return this.prisma.client.organization.findMany({
    where: {
        members: {
        some: {
            userId,
        },
        },
    },
    orderBy: {
        createdAt: "desc",
    },
    });
}

    async findOne(id: string, userId: string) {
        const organization = await this.prisma.client.organization.findFirst({
            where: { id, members: { some: { userId } } },
        });

        if (!organization) {
            throw new NotFoundException('No se encuentra la organizacion');
        }

        return organization;
    }

    async update(id: string, dto: UpdateOrganizationDto, userId: string) {
        await this.findOne(id, userId);

        try {
            return await this.prisma.client.organization.update({
                where: { id },
                data: dto,
            });
        } catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new ConflictException('La organizacion ya existe');
            }
            throw error;
        }
    }

    async remove(id: string, userId: string) {
        await this.findOne(id, userId);

        await this.prisma.client.organization.delete({
            where: { id },
        });

        return 'Organizacion eliminada exitosamente';
    }
}