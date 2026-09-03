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

    async create(dto: CreateOrganizationDto) {
        try {

            return await this.prisma.client.organization.create({
                data: { 
                    name: dto.name, 
                    slug: dto.slug, 
                },
            });
        } catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new ConflictException('La organizacion ya existe');
            }
            throw error;
        }
    }

    async findAll() {
        return this.prisma.client.organization.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const organization = await this.prisma.client.organization.findUnique({
            where: { id },
        });

        if (!organization) {
            throw new NotFoundException('No se encuentra la organizacion');
        }

        return organization;
    }

    async update(id: string, dto: UpdateOrganizationDto) {
        await this.findOne(id);

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

    async remove(id: string) {
        await this.findOne(id);

        await this.prisma.client.organization.delete({
            where: { id },
        });

        return 'Organizacion eliminada exitosamente';
    }
}