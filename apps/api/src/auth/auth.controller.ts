import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./dto/login.dto";
import { RegisterDTO } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { AuthenticatedRequest } from "./types/authenticated-request";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
    constructor (private readonly authService: AuthService) {}

    @Post("register")
    @ApiOperation({ summary: "Registrar un nuevo usuario" })
    @ApiResponse({ status: 201, description: "Usuario registrado exitosamente" })
    @ApiResponse({ status: 409, description: "El usuario ya existe" })
    async register(@Body() dto: RegisterDTO) {
        return this.authService.register(dto);
    }

    @Post("login")
    @ApiOperation({ summary: "Iniciar sesión de un usuario" })
    @ApiResponse({ status: 200, description: "Usuario ha iniciado sesión exitosamente" })
    @ApiResponse({ status: 401, description: "Credenciales inválidas" })
    async login(@Body() dto: LoginDTO) {
        return this.authService.login(dto);
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Obtener el usuario actualmente autenticado" })
    me(@Req() request: AuthenticatedRequest) {
    return request.user;
    }
}