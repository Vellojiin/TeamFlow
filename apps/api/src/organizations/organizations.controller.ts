import { Body, Controller, Get, Post, Param, Patch, Delete } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationController{
    constructor(private readonly organizationsService: OrganizationsService) {}

    @Post()
    @ApiOperation({ summary: 'Crear una nueva organización' })
    @ApiResponse({ status: 201, description: 'Organización creada exitosamente.' })
    @ApiResponse({ status: 409, description: 'La organización ya existe.' })
    async create(@Body() dto: CreateOrganizationDto) {
        return this.organizationsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las organizaciones' })
    @ApiResponse({ status: 200, description: 'Lista de organizaciones obtenida exitosamente.' })
    async findAll() {
        return this.organizationsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una organización por ID' })
    @ApiResponse({ status: 200, description: 'Organización obtenida exitosamente.' })
    @ApiResponse({ status: 404, description: 'No se encuentra la organización.' })
    async findOne(@Param('id') id: string) {
        return this.organizationsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una organización por ID' })
    @ApiResponse({ status: 200, description: 'Organización actualizada exitosamente.' })
    @ApiResponse({ status: 404, description: 'No se encuentra la organización.' })
    async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
        return this.organizationsService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una organización por ID' })
    @ApiResponse({ status: 200, description: 'Organización eliminada exitosamente.' })
    @ApiResponse({ status: 404, description: 'No se encuentra la organización.' })
    async remove(@Param('id') id: string) {
        return this.organizationsService.remove(id);
    }
}