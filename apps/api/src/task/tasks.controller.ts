import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';

import { TaskService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-request';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, OrganizationAccessGuard)
@Controller('organizations/:organizationId/projects/:projectId/tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard, OrganizationAccessGuard)
    @Roles("OWNER", "ADMIN", "MEMBER")
    @ApiParam({ name: 'organizationId', description: 'ID de la organización' })
    @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
    @ApiOperation({ summary: 'Crear nueva tarea' })
    create(
        @Param('organizationId') organizationId: string,
        @Param('projectId') projectId: string,
        @Body() createTaskDto: CreateTaskDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.taskService.create(
            organizationId,
            projectId,
            createTaskDto,
            user.id,
        );
    }

    @Get()
    @ApiParam({ name: 'organizationId', description: 'ID de la organización' })
    @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
    @ApiOperation({
        summary: 'Obtener todas las tareas de un proyecto'
    })
    findAll(
        @Param('organizationId') organizationId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.taskService.findAll(organizationId, projectId);
    }

    @Get(':taskId')
    @ApiParam({ name: 'organizationId', description: 'ID de la organización' })
    @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
    @ApiParam({ name: 'taskId', description: 'ID de la tarea' })
    @ApiOperation({
        summary: 'Obtener una tarea específica de un proyecto'
    })
    findOne(
        @Param('organizationId') organizationId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
    ) {
        return this.taskService.findOne(organizationId, projectId, taskId);
    }

    @Patch(':taskId')
    @UseGuards(JwtAuthGuard, RolesGuard, OrganizationAccessGuard)
    @Roles("OWNER", "ADMIN", "MEMBER")
    @ApiParam({ name: 'organizationId', description: 'ID de la organización' })
    @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
    @ApiParam({ name: 'taskId', description: 'ID de la tarea' })
    @ApiOperation({ summary: 'Actualizar tarea' })
    update(
        @Param('organizationId') organizationId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Body() updateTaskDto: UpdateTaskDto,
    ) {
        return this.taskService.update(
            organizationId,
            projectId,
            taskId,
            updateTaskDto,
        );
    }

    @Patch(":taskId/status")
    @UseGuards(JwtAuthGuard, RolesGuard, OrganizationAccessGuard)
    @Roles("OWNER", "ADMIN", "MEMBER")
    @ApiParam({ name: 'organizationId', description: 'ID de la organización' })
    @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
    @ApiParam({ name: 'taskId', description: 'ID de la tarea' })
    @ApiOperation({ summary: 'Actualizar el estado de una tarea específica de un proyecto' })
    updateStatus(
        @Param('organizationId') organizationId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    ) {
        return this.taskService.updateStatus(
            organizationId,
            projectId,
            taskId,
            updateTaskStatusDto,
        );
    }

    @Delete(':taskId')
    @UseGuards(JwtAuthGuard, RolesGuard, OrganizationAccessGuard)
    @Roles("OWNER", "ADMIN")
    @ApiParam({ name: 'organizationId', description: 'ID de la organización' })
    @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
    @ApiParam({ name: 'taskId', description: 'ID de la tarea' })
    @ApiOperation({ summary: 'Eliminar una tarea específica de un proyecto' })
    remove(
        @Param('organizationId') organizationId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
    ) {
        return this.taskService.remove(organizationId, projectId, taskId);
    }
}
