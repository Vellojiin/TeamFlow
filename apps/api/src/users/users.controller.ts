import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'El usuario ha sido creado exitosamente.',
  })
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
