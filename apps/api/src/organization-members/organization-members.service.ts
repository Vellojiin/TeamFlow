import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { AddMemberDto } from "./dto/add-member.dto";
import { UpdateMemberRoleDto } from "./dto/update-member-role.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

@Injectable()
export class OrganizationMemberService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(organizationId: string) {
        return this.prisma.client.organizationMember.findMany({
            where: {
                organizationId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    async addMember(organizationId: string, addMemberDto: AddMemberDto) {
        const user = await this.prisma.client.user.findUnique({
            where: {
                email: addMemberDto.email.toLowerCase(),
            }
        })

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const existingMember = await this.prisma.client.organizationMember.findFirst({
            where: {
                organizationId,
                userId: user.id,
            },
        });

        if (existingMember) {
            throw new ConflictException('El usuario ya es miembro de esta organización');
        }

        try{
            return await this.prisma.client.organizationMember.create({
                data: {
                    organizationId,
                    userId: user.id,
                    role: "MEMBER",
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            createdAt: true,
                        }
                    }
                }
            });
        }catch(error){
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('El usuario ya es miembro de esta organización');
            }
            throw error;
        }
    }

    async updateRole(organizationId: string, memberId: string, updateMemberRoleDto: UpdateMemberRoleDto) {
        const member = await this.prisma.client.organizationMember.findFirst({
            where: {
                id: memberId,
                organizationId,
            }
        })

        if (!member) {
            throw new NotFoundException('Miembro no encontrado');
        }

        if (member.role === "OWNER") {
    throw new ForbiddenException("El rol del propietario de la organización no se puede cambiar");
}

        return this.prisma.client.organizationMember.update({
            where: {
                id: memberId,
            },
            data: {
                role: updateMemberRoleDto.role,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true,
                    }
                }
            }
        });
    }

    async removeMember(organizationId: string, memberId: string){
        const member = await this.prisma.client.organizationMember.findFirst({
            where: {
                id: memberId,
                organizationId,
            }
        });

        if (!member) {
            throw new NotFoundException('Miembro no encontrado');
        }

        if(member.role === "OWNER") {
            throw new ConflictException('No se puede eliminar al propietario');
        }

        await this.prisma.client.organizationMember.delete({
            where: {
                id: memberId,
            },
        });

        return {
            message: 'Miembro eliminado correctamente',
        }
    }
}
