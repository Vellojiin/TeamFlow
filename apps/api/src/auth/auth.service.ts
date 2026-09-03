import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import * as argon2 from "argon2";
import { PrismaService } from "../database/prisma.service";
import { LoginDTO } from "./dto/login.dto";
import { RegisterDTO } from "./dto/register.dto";

@Injectable()
export class AuthService {
    constructor ( private readonly prisma: PrismaService, private readonly jwtService: JwtService ) {}

    async register(dto: RegisterDTO) {
        const passwordHash = await argon2.hash(dto.password);

        try {
            const user = await this.prisma.client.user.create({
                data: {
                    email: dto.email.toLowerCase().trim(),
                    name: dto.name,
                    password: passwordHash,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            });
            return user;
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new ConflictException("Usuario ya existe");
            }

            throw error;
        }
    }

    async login(dto: LoginDTO) {
        const user = await this.prisma.client.user.findUnique({
            where: {
                email: dto.email.toLowerCase().trim(),
            },
        });

        if (!user) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        const isPasswordValid = await argon2.verify(user.password, dto.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        const payload = {
            sub: user.id,
            email: user.email,
        };

        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
    }

    async validateUser(userId: string) {
        const user = await this.prisma.client.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException("Usuario no encontrado");
        }

        return user;
    }
}