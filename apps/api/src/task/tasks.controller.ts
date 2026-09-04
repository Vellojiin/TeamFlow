import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';

import { TaskService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';

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
    create(@Param('projectId') projectId: string, @Body() createTaskDto: CreateTaskDto) {
        return this.taskService.create(projectId, createTaskDto);
    }

    @Get()
    @ApiParam({ name: 'organizationId', description: 'ID de la organización' })
    @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
    @ApiOperation({
        summary: 'Obtener todas las tareas de un proyecto'
    })
    findAll(@Param('projectId') projectId: string) {
        return this.taskService.findAll(projectId);
    }

    @Get(':taskId')
    @ApiParam({ name: 'organizationId', description: 'ID de la organización' })
    @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
    @ApiParam({ name: 'taskId', description: 'ID de la tarea' })
    @ApiOperation({
        summary: 'Obtener una tarea específica de un proyecto'
    })
    findOne(@Param('projectId') projectId: string, @Param('taskId') taskId: string) {
        return this.taskService.findOne(projectId, taskId);
    }

    @Patch(':taskId')
    @UseGuards(JwtAuthGuard, RolesGuard, OrganizationAccessGuard)
    @Roles("OWNER", "ADMIN", "MEMBER")
    @ApiParam({ name: 'organizationId', description: 'ID de la organización' })
    @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
    @ApiParam({ name: 'taskId', description: 'ID de la tarea' })
    @ApiOperation({ summary: 'Actualizar tarea' })
    update(@Param("projectId") projectId: string, @Param("taskId") taskId: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.taskService.update(projectId, taskId, updateTaskDto);
    }

    @Patch(":taskId/status")
    @UseGuards(JwtAuthGuard, RolesGuard, OrganizationAccessGuard)
    @Roles("OWNER", "ADMIN", "MEMBER")
    @ApiParam({ name: 'organizationId', description: 'ID de la organización' })
    @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
    @ApiParam({ name: 'taskId', description: 'ID de la tarea' })
    @ApiOperation({ summary: 'Actualizar el estado de una tarea específica de un proyecto' })
    updateStatus(@Param('projectId') projectId: string, @Param('taskId') taskId: string, @Body() updateTaskStatusDto: UpdateTaskStatusDto) {
        return this.taskService.updateStatus(projectId, taskId, updateTaskStatusDto);
    }

    @Delete(':taskId')
    @UseGuards(JwtAuthGuard, RolesGuard, OrganizationAccessGuard)
    @Roles("OWNER", "ADMIN")
    @ApiParam({ name: 'organizationId', description: 'ID de la organización' })
    @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
    @ApiParam({ name: 'taskId', description: 'ID de la tarea' })
    @ApiOperation({ summary: 'Eliminar una tarea específica de un proyecto' })
    remove(@Param('projectId') projectId: string, @Param('taskId') taskId: string) {
        return this.taskService.remove(projectId, taskId);
    }
}
