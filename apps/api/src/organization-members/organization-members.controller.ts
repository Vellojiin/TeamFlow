import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { OrganizationMemberService } from './organization-members.service';


@ApiTags('organization-members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationAccessGuard, RolesGuard)
@Controller("organizations/:organizationId/members")
export class OrganizationMembersController {
    constructor(private readonly organizationMemberService: OrganizationMemberService) {}

    @Get()
    @ApiOperation({ summary: 'Listar todos los miembros de una organizacion' })
    async findAll(@Param('organizationId') organizationId: string) {
        return this.organizationMemberService.findAll(organizationId);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("OWNER", "ADMIN")
    @ApiOperation({ summary: 'Agregar un nuevo miembro a la organizacion' })
    async addMember(
        @Param('organizationId') organizationId: string,
        @Body() addMemberDto: AddMemberDto
    ) {
        return this.organizationMemberService.addMember(organizationId, addMemberDto);
    }

    @Patch(':memberId/role')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("OWNER", "ADMIN")
    @ApiOperation({ summary: 'Actualizar el rol de un miembro de la organizacion' })
    async updateMemberRole(
        @Param('organizationId') organizationId: string,
        @Param('memberId') memberId: string,
        @Body() updateMemberRoleDto: UpdateMemberRoleDto
    ) {
        return this.organizationMemberService.updateRole(organizationId, memberId, updateMemberRoleDto);
    }

    @Delete(':memberId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("OWNER", "ADMIN")
    @ApiOperation({ summary: 'Eliminar un miembro de la organizacion' })
    async removeMember(
        @Param('organizationId') organizationId: string,
        @Param('memberId') memberId: string
    ) {
        return this.organizationMemberService.removeMember(organizationId, memberId);
    }
}