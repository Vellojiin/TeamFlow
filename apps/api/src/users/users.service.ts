import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor (private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.client.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });
    }

    async create(dto: CreateUserDto) {
        return this.prisma.client.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password: dto.password,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });
    }
}