import { Body,  Controller, Delete, Get, Param, Patch, Post, UseGuards} from "@nestjs/common";

import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrganizationAccessGuard } from "../auth/guards/organization-access.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectsService } from "./projects.service";

@ApiTags("projects")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationAccessGuard, RolesGuard)
@Controller("organizations/:organizationId/projects")
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Post()
    @UseGuards(JwtAuthGuard, OrganizationAccessGuard, RolesGuard)
    @Roles("OWNER", "ADMIN")
    @ApiOperation({ summary: "Crear nuevo proyecto" })
    async create(
        @Param("organizationId") organizationId: string,
        @Body() createProjectDto: CreateProjectDto
    ) {
        return this.projectsService.create(organizationId, createProjectDto);
    }

    @Get()
    @ApiOperation({ summary: "Obtener todos los proyectos de una organización" })
    async findAll(@Param("organizationId") organizationId: string) {
        return this.projectsService.findAll(organizationId);
    }

    @Get(":projectId")
    @ApiOperation({ summary: "Obtener un proyecto por ID" })
    async findOne(
        @Param("organizationId") organizationId: string,
        @Param("projectId") projectId: string
    ) {
        return this.projectsService.findOne(organizationId, projectId);
    }

    @Patch(":projectId")
    @UseGuards(JwtAuthGuard, OrganizationAccessGuard, RolesGuard)
    @Roles("OWNER", "ADMIN")
    @ApiOperation({ summary: "Actualizar un proyecto por ID" })
    async update(
        @Param("organizationId") organizationId: string,
        @Param("projectId") projectId: string,
        @Body() updateProjectDto: UpdateProjectDto
    ) {
        return this.projectsService.update(organizationId, projectId, updateProjectDto);
    }

    @Delete(":projectId")
    @UseGuards(JwtAuthGuard, OrganizationAccessGuard, RolesGuard)
    @Roles("OWNER", "ADMIN")
    @ApiOperation({ summary: "Eliminar un proyecto por ID" })
    async remove(
        @Param("organizationId") organizationId: string,
        @Param("projectId") projectId: string
    ) {
        return this.projectsService.remove(organizationId, projectId);
    }
}