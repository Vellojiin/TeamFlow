import { Body, Controller, Get, Post, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest, AuthenticatedUser } from '../auth/types/authenticated-request';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationController{
    constructor(private readonly organizationsService: OrganizationsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear una nueva organización' })
    @ApiResponse({ status: 201, description: 'Organización creada exitosamente.' })
    @ApiResponse({ status: 409, description: 'La organización ya existe.' })
    async create(
        @Req() request: AuthenticatedRequest,
        @Body() dto: CreateOrganizationDto
    ) {
        return this.organizationsService.create(dto, request.user.id);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener todas las organizaciones' })
    @ApiResponse({ status: 200, description: 'Lista de organizaciones obtenida exitosamente.' })
    async findAll(@CurrentUser() user: AuthenticatedUser) {
        return this.organizationsService.findAll(user.id);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener una organización por ID' })
    @ApiResponse({ status: 200, description: 'Organización obtenida exitosamente.' })
    @ApiResponse({ status: 404, description: 'No se encuentra la organización.' })
    async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.organizationsService.findOne(id, user.id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'OWNER')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Actualizar una organización por ID' })
    @ApiResponse({ status: 200, description: 'Organización actualizada exitosamente.' })
    @ApiResponse({ status: 404, description: 'No se encuentra la organización.' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateOrganizationDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.organizationsService.update(id, dto, user.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'OWNER')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar una organización por ID' })
    @ApiResponse({ status: 200, description: 'Organización eliminada exitosamente.' })
    @ApiResponse({ status: 404, description: 'No se encuentra la organización.' })
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.organizationsService.remove(id, user.id);
    }
}