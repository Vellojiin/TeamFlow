import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
    const passwordHash = await argon2.hash(dto.password);

    try {
      return await this.prisma.client.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          name: dto.name,
          password: passwordHash,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El email ya está registrado');
      }
      throw error;
    }
  }
}
